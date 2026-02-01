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
    // Validate session exists and is not expired
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Invalid session");
    }
    if (session.expiresAt < Date.now()) {
      throw new Error("Session expired");
    }

    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Batch fetch all unique menu items
    const uniqueMenuIds = [...new Set(items.map((i) => i.menuItemId))];
    const menuItems = await Promise.all(
      uniqueMenuIds.map((id) => ctx.db.get(id))
    );

    // Create Map for O(1) lookups
    const menuMap = new Map<string, (typeof menuItems)[0]>();
    uniqueMenuIds.forEach((id, i) => menuMap.set(id.toString(), menuItems[i]!));

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
    // Validate session exists and is not expired
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Invalid session");
    }
    if (session.expiresAt < Date.now()) {
      throw new Error("Session expired");
    }

    // Fetch menu item from database to get authoritative price
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
      price: menuItem.price, // Use authoritative price from database
      addedAt: Date.now(),
    });
  },
});

export const clearSessionCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    // Validate session exists (prevents clearing arbitrary session carts)
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Invalid session");
    }

    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
  },
});
