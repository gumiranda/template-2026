import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession, batchFetchMenuItems, SESSION_DURATION_MS, isValidSessionId, validateQuantity } from "./lib/helpers";
import { validateMenuItemForCart } from "./lib/cartHelpers";
import { MAX_SESSIONS_PER_TABLE, MAX_CART_ITEM_QUANTITY } from "./lib/constants";

export const createSession = mutation({
  args: {
    sessionId: v.string(),
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
  },
  handler: async (ctx, args) => {
    // Validate session ID format (must be UUID v4)
    if (!isValidSessionId(args.sessionId)) {
      throw new Error("Invalid session ID format: must be a valid UUID v4");
    }

    // Validate restaurant and table exist
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const table = await ctx.db.get(args.tableId);
    if (!table || table.restaurantId !== args.restaurantId) {
      throw new Error("Invalid table for this restaurant");
    }

    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) return existing._id;

    // Rate limiting: max 10 active sessions per table to prevent abuse
    const now = Date.now();
    const activeTableSessions = await ctx.db
      .query("sessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();
    const activeCount = activeTableSessions.filter((s) => s.expiresAt > now).length;
    if (activeCount >= MAX_SESSIONS_PER_TABLE) {
      throw new Error("Too many active sessions for this table. Please try again later.");
    }

    return await ctx.db.insert("sessions", {
      sessionId: args.sessionId,
      restaurantId: args.restaurantId,
      tableId: args.tableId,
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
    validateQuantity(args.quantity);

    const session = await validateSession(ctx, args.sessionId);

    const menuItem = await validateMenuItemForCart(ctx, args.menuItemId, session.restaurantId);

    const existing = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_sessionId_and_menuItemId", (q) =>
        q.eq("sessionId", args.sessionId).eq("menuItemId", args.menuItemId)
      )
      .first();

    if (existing) {
      const newQuantity = existing.quantity + args.quantity;
      if (newQuantity > MAX_CART_ITEM_QUANTITY) {
        throw new Error(`Cannot exceed ${MAX_CART_ITEM_QUANTITY} units per item`);
      }
      await ctx.db.patch(existing._id, {
        quantity: newQuantity,
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
    // checkExpiry: false — allow clearing carts from expired sessions
    // to support cleanup after order completion (session may expire during checkout)
    await validateSession(ctx, args.sessionId, { checkExpiry: false });

    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    return { deletedCount: items.length };
  },
});
