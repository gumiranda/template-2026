import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createSession = mutation({
  args: {
    sessionId: v.string(),
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("sessions", {
      sessionId: args.sessionId,
      restaurantId: args.restaurantId,
      tableId: args.tableId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  },
});

export const getSessionCart = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const itemsWithMenuInfo = await Promise.all(
      items.map(async (item) => {
        const menuItem = await ctx.db.get(item.menuItemId);
        return { ...item, menuItem };
      })
    );

    return itemsWithMenuInfo;
  },
});

export const addToSessionCart = mutation({
  args: {
    sessionId: v.string(),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("menuItemId"), args.menuItemId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
      return existing._id;
    }

    return await ctx.db.insert("sessionCartItems", {
      sessionId: args.sessionId,
      menuItemId: args.menuItemId,
      quantity: args.quantity,
      price: args.price,
      addedAt: Date.now(),
    });
  },
});

export const clearSessionCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
