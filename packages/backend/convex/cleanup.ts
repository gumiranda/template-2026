import { internalMutation } from "./_generated/server";

export const deleteExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .take(100);

    for (const session of expiredSessions) {
      // Clean up session cart items
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
