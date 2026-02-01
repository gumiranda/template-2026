import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser, isRestaurantStaff } from "./lib/auth";
import { batchFetchMenuItems } from "./lib/helpers";
import { Role } from "./lib/types";

export const getCart = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can view table carts");
    }

    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    const restaurant = await ctx.db.get(table.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    // SUPERADMIN can access any restaurant, others must be owner
    if (user.role !== Role.SUPERADMIN && restaurant.ownerId !== user._id) {
      throw new Error("Not authorized to access this restaurant's carts");
    }

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
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can modify table carts");
    }

    const table = await ctx.db.get(args.tableId);
    if (!table || table.restaurantId !== args.restaurantId) {
      throw new Error("Invalid table for this restaurant");
    }

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    if (user.role !== Role.SUPERADMIN && restaurant.ownerId !== user._id) {
      throw new Error("Not authorized to modify this restaurant's carts");
    }

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
      price: menuItem.price,
      addedAt: Date.now(),
    });
  },
});

export const clearCart = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can clear carts");
    }

    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    const restaurantForAuth = await ctx.db.get(table.restaurantId);
    if (!restaurantForAuth) {
      throw new Error("Restaurant not found");
    }

    if (user.role !== Role.SUPERADMIN && restaurantForAuth.ownerId !== user._id) {
      throw new Error("Not authorized to clear this restaurant's carts");
    }

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("isActive"), true))
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
