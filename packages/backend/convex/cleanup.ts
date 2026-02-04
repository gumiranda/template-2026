import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { CLEANUP_BATCH_SIZE, ABANDONED_CART_THRESHOLD_MS } from "./lib/constants";

export const deleteExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .take(CLEANUP_BATCH_SIZE);

    for (const session of expiredSessions) {
      const cartItems = await ctx.db
        .query("sessionCartItems")
        .withIndex("by_session", (q) => q.eq("sessionId", session.sessionId))
        .collect();

      for (const item of cartItems) {
        await ctx.db.delete(item._id);
      }

      await ctx.db.delete(session._id);
    }

    // Self-schedule if there are more items to process
    if (expiredSessions.length === CLEANUP_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.cleanup.deleteExpiredSessions);
    }

    return { deletedSessions: expiredSessions.length };
  },
});

export const deleteAbandonedCarts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - ABANDONED_CART_THRESHOLD_MS;

    // Find inactive carts older than threshold using _creationTime as a proxy.
    // _creationTime is used because carts don't track when they became inactive.
    // This means a cart created >24h ago that was recently deactivated could be
    // cleaned up early, but this is acceptable for abandoned cart cleanup.
    const inactiveCarts = await ctx.db
      .query("carts")
      .withIndex("by_isActive", (q) => q.eq("isActive", false))
      .filter((q) => q.lt(q.field("_creationTime"), threshold))
      .take(CLEANUP_BATCH_SIZE);

    let deletedCarts = 0;
    for (const cart of inactiveCarts) {
      const cartItems = await ctx.db
        .query("cartItems")
        .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
        .collect();

      for (const item of cartItems) {
        await ctx.db.delete(item._id);
      }

      await ctx.db.delete(cart._id);
      deletedCarts++;
    }

    // Self-schedule if there are more items to process
    if (inactiveCarts.length === CLEANUP_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.cleanup.deleteAbandonedCarts);
    }

    return { deletedCarts };
  },
});
