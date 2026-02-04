import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRestaurantStaffAccess } from "./lib/auth";
import { batchFetchMenuItems, validateQuantity } from "./lib/helpers";

export const getCart = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    await requireRestaurantStaffAccess(ctx, table.restaurantId);

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_tableId_and_isActive", (q) =>
        q.eq("tableId", args.tableId).eq("isActive", true)
      )
      .first();

    if (!cart) {
      return { items: [] };
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    const menuMap = await batchFetchMenuItems(
      ctx,
      cartItems.map((i) => i.menuItemId)
    );

    const itemsWithMenu = cartItems.map((item) => ({
      ...item,
      menuItem: menuMap.get(item.menuItemId.toString()) ?? null,
    }));

    return { ...cart, items: itemsWithMenu };
  },
});

export const addToCart = mutation({
  args: {
    tableId: v.id("tables"),
    restaurantId: v.id("restaurants"),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRestaurantStaffAccess(ctx, args.restaurantId);

    const table = await ctx.db.get(args.tableId);
    if (!table || table.restaurantId !== args.restaurantId) {
      throw new Error("Invalid table for this restaurant");
    }

    validateQuantity(args.quantity);

    const menuItem = await ctx.db.get(args.menuItemId);
    if (!menuItem) {
      throw new Error("Menu item not found");
    }
    if (menuItem.restaurantId !== args.restaurantId) {
      throw new Error("Menu item does not belong to this restaurant");
    }
    if (!menuItem.isActive) {
      throw new Error("Menu item is not available");
    }

    const existingCart = await ctx.db
      .query("carts")
      .withIndex("by_tableId_and_isActive", (q) =>
        q.eq("tableId", args.tableId).eq("isActive", true)
      )
      .first();

    const cartId = existingCart
      ? existingCart._id
      : await ctx.db.insert("carts", {
          tableId: args.tableId,
          restaurantId: args.restaurantId,
          isActive: true,
        });

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId_and_menuItemId", (q) =>
        q.eq("cartId", cartId).eq("menuItemId", args.menuItemId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
      return existing._id;
    }

    return await ctx.db.insert("cartItems", {
      cartId,
      menuItemId: args.menuItemId,
      quantity: args.quantity,
      price: menuItem.price,
      addedAt: Date.now(),
    });
  },
});

export const clearCart = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    await requireRestaurantStaffAccess(ctx, table.restaurantId);

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_tableId_and_isActive", (q) =>
        q.eq("tableId", args.tableId).eq("isActive", true)
      )
      .first();

    if (!cart) return { deletedCount: 0 };

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    await ctx.db.patch(cart._id, { isActive: false });

    return { deletedCount: items.length };
  },
});
