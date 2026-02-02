import { internalMutation } from "./_generated/server";

const ABANDONED_CART_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export const deleteExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .take(100);

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

    return { deletedSessions: expiredSessions.length };
  },
});

export const deleteAbandonedCarts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - ABANDONED_CART_THRESHOLD_MS;

    // Find inactive carts older than threshold using _creationTime
    const inactiveCarts = await ctx.db
      .query("carts")
      .withIndex("by_restaurantId_and_isActive")
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), false),
          q.lt(q.field("_creationTime"), threshold)
        )
      )
      .take(100);

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

    return { deletedCarts };
  },
});
