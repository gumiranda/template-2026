import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Plan, SubscriptionEventType } from "./lib/types";
import { getAuthenticatedUser, isAdmin } from "./lib/auth";

export const getPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptionPlans")
      .collect()
      .then((plans) => plans.filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
  },
});

export const getPlanBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getCurrentPlan = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;
    return user.plan ?? Plan.FREE;
  },
});

export const seedPlans = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) {
      throw new Error("Only admins can seed plans");
    }

    const existing = await ctx.db.query("subscriptionPlans").first();
    if (existing) {
      return { message: "Plans already seeded" };
    }

    const plans = [
      {
        name: "Free",
        slug: "free",
        price: 0,
        interval: "month",
        features: [
          "Up to 3 team members",
          "1,000 API requests/month",
          "Basic analytics",
          "Community support",
          "1 project",
        ],
        maxTeamMembers: 3,
        maxProjects: 1,
        maxApiRequests: 1000,
        isActive: true,
        sortOrder: 0,
      },
      {
        name: "Pro",
        slug: "pro",
        price: 2900,
        interval: "month",
        features: [
          "Up to 20 team members",
          "50,000 API requests/month",
          "Advanced analytics",
          "Priority email support",
          "10 projects",
          "Custom integrations",
          "API access",
        ],
        maxTeamMembers: 20,
        maxProjects: 10,
        maxApiRequests: 50000,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Enterprise",
        slug: "enterprise",
        price: 9900,
        interval: "month",
        features: [
          "Unlimited team members",
          "Unlimited API requests",
          "Real-time analytics",
          "24/7 dedicated support",
          "Unlimited projects",
          "Custom integrations",
          "SSO / SAML",
          "SLA guarantee",
          "Audit logs",
        ],
        maxTeamMembers: -1,
        maxProjects: -1,
        maxApiRequests: -1,
        isActive: true,
        sortOrder: 2,
      },
    ];

    for (const plan of plans) {
      await ctx.db.insert("subscriptionPlans", plan);
    }

    return { message: "Plans seeded successfully" };
  },
});

export const changePlan = mutation({
  args: { planSlug: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const plan = await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_slug", (q) => q.eq("slug", args.planSlug))
      .unique();

    if (!plan || !plan.isActive) {
      throw new Error("Invalid plan");
    }

    const currentPlan = user.plan ?? Plan.FREE;
    const planOrder = { free: 0, pro: 1, enterprise: 2 };
    const currentOrder = planOrder[currentPlan as keyof typeof planOrder] ?? 0;
    const newOrder = planOrder[args.planSlug as keyof typeof planOrder] ?? 0;

    let eventType = SubscriptionEventType.CREATED;
    if (newOrder > currentOrder) {
      eventType = SubscriptionEventType.UPGRADED;
    } else if (newOrder < currentOrder) {
      eventType = SubscriptionEventType.DOWNGRADED;
    }

    await ctx.db.patch(user._id, {
      plan: args.planSlug,
    });

    await ctx.db.insert("subscriptionEvents", {
      userId: user._id,
      eventType,
      planSlug: args.planSlug,
    });

    return { success: true, plan: args.planSlug };
  },
});

export const getSubscriptionHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("subscriptionEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});
