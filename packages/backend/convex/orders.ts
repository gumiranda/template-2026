import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { OrderStatus } from "./lib/types";

export const getOrdersByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const table = await ctx.db.get(order.tableId);
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        return { ...order, table, items };
      })
    );

    return ordersWithDetails;
  },
});

export const createOrder = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    sessionId: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        totalPrice: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const total = args.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId,
      tableId: args.tableId,
      sessionId: args.sessionId,
      status: OrderStatus.PENDING,
      total,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of args.items) {
      await ctx.db.insert("orderItems", {
        orderId,
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
      });
    }

    return orderId;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
