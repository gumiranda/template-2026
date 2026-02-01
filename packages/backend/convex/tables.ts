import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    // 1. Fetch all tables
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    // 2. Fetch all active carts for restaurant
    const allCarts = await ctx.db
      .query("carts")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Map: tableId -> cart
    const cartByTable = new Map<string, (typeof allCarts)[0]>();
    allCarts.forEach((c) => cartByTable.set(c.tableId.toString(), c));

    // 3. Batch fetch cartItems for all carts
    const cartItemsArrays = await Promise.all(
      allCarts.map((c) =>
        ctx.db
          .query("cartItems")
          .withIndex("by_cart", (q) => q.eq("cartId", c._id))
          .collect()
      )
    );
    const itemsByCart = new Map<string, (typeof cartItemsArrays)[0]>();
    allCarts.forEach((c, i) =>
      itemsByCart.set(c._id.toString(), cartItemsArrays[i]!)
    );

    // 4. Batch fetch menu items for all cart items
    const allCartItems = cartItemsArrays.flat();
    const uniqueMenuIds = [...new Set(allCartItems.map((i) => i.menuItemId))];
    const menuItems = await Promise.all(
      uniqueMenuIds.map((id) => ctx.db.get(id))
    );
    const menuMap = new Map<string, (typeof menuItems)[0]>();
    uniqueMenuIds.forEach((id, i) => menuMap.set(id.toString(), menuItems[i]!));

    // 5. Fetch all orders for restaurant
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

    // 6. Assemble overview
    return tables.map((table) => {
      const cart = cartByTable.get(table._id.toString());
      let cartItems: Array<
        (typeof allCartItems)[0] & { menuItem: (typeof menuItems)[0] | null }
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
  args:{
    restaurantId: v.id("restaurants"),
    tableNumber: v.string(),
    capacity: v.number(),
    qrCode: v.string(),
    isActive: v.boolean(),
  },
  handler:async (ctx, args)=> {
    return await ctx.db.insert("tables",args);;
  },
})