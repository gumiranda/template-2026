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

    // Batch fetch unique tables
    const uniqueTableIds = [...new Set(orders.map((o) => o.tableId))];
    const tables = await Promise.all(
      uniqueTableIds.map((id) => ctx.db.get(id))
    );
    const tableMap = new Map<string, (typeof tables)[0]>();
    uniqueTableIds.forEach((id, i) => tableMap.set(id.toString(), tables[i]!));

    // Parallel fetch all order items (batched round trip)
    const orderItemsArrays = await Promise.all(
      orders.map((order) =>
        ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect()
      )
    );

    // Map order items by orderId
    const itemsMap = new Map<string, (typeof orderItemsArrays)[0]>();
    orders.forEach((order, i) =>
      itemsMap.set(order._id.toString(), orderItemsArrays[i]!)
    );

    return orders.map((order) => ({
      ...order,
      table: tableMap.get(order.tableId.toString()) ?? null,
      items: itemsMap.get(order._id.toString()) ?? [],
    }));
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

    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("orderItems", {
          orderId,
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })
      )
    );

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
