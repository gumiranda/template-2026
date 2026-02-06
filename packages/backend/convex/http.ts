import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/backend";
import Stripe from "stripe";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();

    const wh = new Webhook(webhookSecret);
    let event: WebhookEvent;

    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.warn("Clerk webhook signature verification failed", {
        path: "/clerk-webhook",
        error: err instanceof Error ? err.message : "Unknown error",
      });
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.updated": {
        const { id, first_name, last_name } = event.data;
        const name = [first_name, last_name].filter(Boolean).join(" ") || "Unknown";
        await ctx.runMutation(internal.clerkWebhook.syncClerkUser, {
          clerkId: id,
          name,
        });
        break;
      }
      case "user.deleted": {
        if (event.data.id) {
          await ctx.runMutation(internal.clerkWebhook.handleClerkUserDeleted, {
            clerkId: event.data.id,
          });
        }
        break;
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

const ALLOWED_STRIPE_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.finalized",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "payment_intent.processing",
]);

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecret || !webhookSecret) {
      return new Response("Stripe not configured", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const body = await request.text();
    const stripe = new Stripe(stripeSecret);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.warn("Stripe webhook signature verification failed", {
        path: "/stripe-webhook",
        error: err instanceof Error ? err.message : "Unknown error",
      });
      return new Response("Invalid webhook signature", { status: 400 });
    }

    if (!ALLOWED_STRIPE_EVENTS.has(event.type)) {
      return new Response("Event type not handled", { status: 200 });
    }

    // Extract customer ID from the event
    let customerId: string | undefined;
    const obj = event.data.object;

    if ("customer" in obj && typeof obj.customer === "string") {
      customerId = obj.customer;
    }

    if (customerId) {
      await ctx.runMutation(internal.stripe.scheduleStripeSync, {
        stripeCustomerId: customerId,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
