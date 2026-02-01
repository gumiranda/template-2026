import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  getAuthenticatedUser,
  isRestaurantStaff,
  canManageRestaurant,
  requireRestaurantAccess,
} from "./lib/auth";
import { batchFetchMenuItems } from "./lib/helpers";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
  },
});

export const getTablesOverview = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can view tables overview");
    }

    const canAccess = await canManageRestaurant(ctx, user._id, args.restaurantId);
    if (!canAccess) {
      throw new Error("Not authorized to access this restaurant's tables");
    }

    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const allCarts = await ctx.db
      .query("carts")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const cartByTable = new Map<string, (typeof allCarts)[0]>();
    allCarts.forEach((c) => cartByTable.set(c.tableId.toString(), c));

    const cartItemsArrays = await Promise.all(
      allCarts.map((c) =>
        ctx.db
          .query("cartItems")
          .withIndex("by_cart", (q) => q.eq("cartId", c._id))
          .collect()
      )
    );
    const itemsByCart = new Map<string, (typeof cartItemsArrays)[0]>();
    allCarts.forEach((c, i) => {
      const items = cartItemsArrays[i];
      if (items) itemsByCart.set(c._id.toString(), items);
    });

    const allCartItems = cartItemsArrays.flat();
    const menuMap = await batchFetchMenuItems(
      ctx,
      allCartItems.map((i) => i.menuItemId)
    );

    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
    const ordersByTable = new Map<string, typeof allOrders>();
    allOrders.forEach((o) => {
      const key = o.tableId.toString();
      if (!ordersByTable.has(key)) ordersByTable.set(key, []);
      ordersByTable.get(key)!.push(o);
    });

    return tables.map((table) => {
      const cart = cartByTable.get(table._id.toString());
      let cartItems: Array<
        (typeof allCartItems)[0] & { menuItem: Doc<"menuItems"> | null }
      > = [];
      let total = 0;

      if (cart) {
        const rawItems = itemsByCart.get(cart._id.toString()) ?? [];
        cartItems = rawItems.map((item) => ({
          ...item,
          menuItem: menuMap.get(item.menuItemId.toString()) ?? null,
        }));
        total = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      }

      return {
        table,
        cartItems,
        total,
        orders: ordersByTable.get(table._id.toString()) ?? [],
      };
    });
  },
});

export const createTable = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    tableNumber: v.string(),
    capacity: v.number(),
    qrCode: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    return await ctx.db.insert("tables", args);
  },
});