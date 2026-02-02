import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/backend";

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
    } catch {
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

export default http;
