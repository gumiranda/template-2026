import { v } from "convex/values";
import { query } from "./_generated/server";

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
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const overview = await Promise.all(
      tables.map(async (table) => {
        const cart = await ctx.db
          .query("carts")
          .withIndex("by_table", (q) => q.eq("tableId", table._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .first();

        let cartItems: any[] = [];
        let total = 0;

        if (cart) {
          const items = await ctx.db
            .query("cartItems")
            .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
            .collect();

          cartItems = await Promise.all(
            items.map(async (item) => {
              const menuItem = await ctx.db.get(item.menuItemId);
              return { ...item, menuItem };
            })
          );

          total = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
        }

        const orders = await ctx.db
          .query("orders")
          .withIndex("by_table", (q) => q.eq("tableId", table._id))
          .collect();

        return { table, cartItems, total, orders };
      })
    );

    return overview;
  },
});

export const getByIdentifier = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tableId);
  },
});
