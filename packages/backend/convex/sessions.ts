import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession, batchFetchMenuItems, SESSION_DURATION_MS } from "./lib/helpers";

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
      expiresAt: Date.now() + SESSION_DURATION_MS,
    });
  },
});

export const getSessionCart = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    await validateSession(ctx, args.sessionId);

    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const menuMap = await batchFetchMenuItems(
      ctx,
      items.map((i) => i.menuItemId)
    );

    return items.map((item) => ({
      ...item,
      menuItem: menuMap.get(item.menuItemId.toString()) ?? null,
    }));
  },
});

export const addToSessionCart = mutation({
  args: {
    sessionId: v.string(),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionId);

    const menuItem = await ctx.db.get(args.menuItemId);
    if (!menuItem) {
      throw new Error("Menu item not found");
    }
    if (menuItem.restaurantId !== session.restaurantId) {
      throw new Error("Menu item does not belong to this restaurant");
    }
    if (!menuItem.isActive) {
      throw new Error("Menu item is not available");
    }

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
      price: menuItem.price,
      addedAt: Date.now(),
    });
  },
});

export const clearSessionCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    await validateSession(ctx, args.sessionId, { checkExpiry: false });

    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    return { deletedCount: items.length };
  },
});
