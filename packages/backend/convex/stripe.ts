import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthenticatedUser } from "./lib/auth";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

const ALLOWED_STRIPE_HOSTS = [
  "checkout.stripe.com",
  "billing.stripe.com",
];

function validateStripeUrl(url: string | null): string {
  if (!url) throw new Error("No URL returned from Stripe");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("Invalid Stripe URL: expected https protocol");
  }
  if (!ALLOWED_STRIPE_HOSTS.includes(parsed.hostname)) {
    throw new Error(`Invalid Stripe URL: unexpected host ${parsed.hostname}`);
  }
  return url;
}

export const upsertStripeData = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    subscriptionId: v.optional(v.string()),
    status: v.optional(v.string()),
    priceId: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    paymentMethodBrand: v.optional(v.string()),
    paymentMethodLast4: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const data = {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      subscriptionId: args.subscriptionId,
      status: args.status,
      priceId: args.priceId,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      paymentMethodBrand: args.paymentMethodBrand,
      paymentMethodLast4: args.paymentMethodLast4,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("stripeData", data);
    }
  },
});

export const syncStripeDataToConvex = internalAction({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const stripe = getStripe();

    // Find user by stripeCustomerId
    const stripeRecord = await ctx.runQuery(
      internal.stripe.getStripeDataByCustomerId,
      { stripeCustomerId: args.stripeCustomerId }
    );

    if (!stripeRecord) {
      console.warn(
        `No user found for Stripe customer ${args.stripeCustomerId}`
      );
      return;
    }

    // Fetch subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: args.stripeCustomerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    const subscription = subscriptions.data[0];

    let paymentMethodBrand: string | undefined;
    let paymentMethodLast4: string | undefined;

    if (subscription) {
      const pm = subscription.default_payment_method;
      if (pm && typeof pm !== "string" && pm.card) {
        paymentMethodBrand = pm.card.brand;
        paymentMethodLast4 = pm.card.last4;
      }

      // In Stripe SDK v20+, period info is on subscription items
      const firstItem = subscription.items.data[0];

      await ctx.runMutation(internal.stripe.upsertStripeData, {
        userId: stripeRecord.userId,
        stripeCustomerId: args.stripeCustomerId,
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId: firstItem?.price?.id,
        currentPeriodStart: firstItem
          ? firstItem.current_period_start * 1000
          : undefined,
        currentPeriodEnd: firstItem
          ? firstItem.current_period_end * 1000
          : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        paymentMethodBrand,
        paymentMethodLast4,
      });
    } else {
      // No subscription found, update with just customer info
      await ctx.runMutation(internal.stripe.upsertStripeData, {
        userId: stripeRecord.userId,
        stripeCustomerId: args.stripeCustomerId,
      });
    }
  },
});

export const getStripeDataByCustomerId = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("stripeData")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();
  },
});

// Shared helper for getting or creating a Stripe customer (avoids action-calling-action)
async function getOrCreateStripeCustomerHelper(
  ctx: { auth: { getUserIdentity: () => Promise<any> }; runQuery: any; runMutation: any }
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
    clerkId: identity.subject,
  });
  if (!user) throw new Error("User not found");

  const existingStripeData = await ctx.runQuery(
    internal.stripe.getStripeDataByUserId,
    { userId: user._id }
  );

  if (existingStripeData?.stripeCustomerId) {
    return existingStripeData.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: identity.email ?? undefined,
    name: user.name,
    metadata: { convexUserId: user._id, clerkId: identity.subject },
  });

  await ctx.runMutation(internal.stripe.upsertStripeData, {
    userId: user._id,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export const getOrCreateStripeCustomer = internalAction({
  args: {},
  handler: async (ctx): Promise<string> => {
    return getOrCreateStripeCustomerHelper(ctx);
  },
});

export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getStripeDataByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const createCheckoutSession = action({
  args: {
    priceId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const stripeCustomerId = await getOrCreateStripeCustomerHelper(ctx);

    const stripe = getStripe();
    const priceId = args.priceId ?? process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error("STRIPE_PRICE_ID not configured");
    if (!priceId.startsWith("price_")) {
      throw new Error("Invalid price ID format");
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.HOSTING_URL;
    if (!baseUrl) throw new Error("App URL not configured");

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription`,
    });

    return validateStripeUrl(session.url);
  },
});

export const syncAfterSuccess = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(args.sessionId);

    if (!session.customer || typeof session.customer !== "string") {
      throw new Error("No customer in session");
    }

    // Eagerly sync to prevent race condition with webhook
    await ctx.runAction(internal.stripe.syncStripeDataToConvex, {
      stripeCustomerId: session.customer,
    });
  },
});

export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;

    return ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const createBillingPortalSession = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) throw new Error("User not found");

    const stripeData = await ctx.runQuery(
      internal.stripe.getStripeDataByUserId,
      { userId: user._id }
    );

    if (!stripeData?.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.HOSTING_URL;
    if (!baseUrl) throw new Error("App URL not configured");

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeData.stripeCustomerId,
      return_url: `${baseUrl}/subscription`,
    });

    return validateStripeUrl(session.url);
  },
});
