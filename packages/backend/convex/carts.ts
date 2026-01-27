import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCart = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!cart) {
      return { items: [] };
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    const itemsWithMenu = await Promise.all(
      cartItems.map(async (item) => {
        const menuItem = await ctx.db.get(item.menuItemId);
        return { ...item, menuItem };
      })
    );

    return { ...cart, items: itemsWithMenu };
  },
});

export const addToCart = mutation({
  args: {
    tableId: v.id("tables"),
    restaurantId: v.id("restaurants"),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!cart) {
      const cartId = await ctx.db.insert("carts", {
        tableId: args.tableId,
        restaurantId: args.restaurantId,
        isActive: true,
        createdAt: Date.now(),
      });
      cart = (await ctx.db.get(cartId))!;
    }

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart!._id))
      .filter((q) => q.eq(q.field("menuItemId"), args.menuItemId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
      return existing._id;
    }

    return await ctx.db.insert("cartItems", {
      cartId: cart._id,
      menuItemId: args.menuItemId,
      quantity: args.quantity,
      price: args.price,
      addedAt: Date.now(),
    });
  },
});

export const clearCart = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!cart) return;

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.patch(cart._id, { isActive: false });
  },
});
