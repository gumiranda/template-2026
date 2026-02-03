import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { OrderStatus } from "./lib/types";
import { requireRestaurantStaffAccess } from "./lib/auth";
import { batchFetchTables, validateSession, validateOrderItems } from "./lib/helpers";
import { orderStatusValidator } from "./schema";

export const getOrdersByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantStaffAccess(ctx, args.restaurantId);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    const tableIds = orders
      .map((o) => o.tableId)
      .filter((id): id is Id<"tables"> => id !== undefined);

    const tableMap = await batchFetchTables(ctx, tableIds);

    const orderItemsArrays = await Promise.all(
      orders.map((order) =>
        ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect()
      )
    );

    const itemsMap = new Map<string, (typeof orderItemsArrays)[0]>();
    orders.forEach((order, i) => {
      const items = orderItemsArrays[i];
      if (items) itemsMap.set(order._id.toString(), items);
    });

    return orders.map((order) => ({
      ...order,
      table: order.tableId
        ? tableMap.get(order.tableId.toString()) ?? null
        : null,
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
        quantity: v.number(),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate session - ensures the session exists, is not expired, and matches the restaurant/table
    const session = await validateSession(ctx, args.sessionId);
    if (session.restaurantId !== args.restaurantId) {
      throw new Error("Session does not belong to this restaurant");
    }
    if (session.tableId !== args.tableId) {
      throw new Error("Session does not belong to this table");
    }

    const table = await ctx.db.get(args.tableId);
    if (!table || table.restaurantId !== args.restaurantId) {
      throw new Error("Invalid table");
    }

    validateOrderItems(args.items);

    const itemsWithServerPrices = await Promise.all(
      args.items.map(async (item) => {
        const menuItem = await ctx.db.get(item.menuItemId);
        if (!menuItem || menuItem.restaurantId !== args.restaurantId) {
          throw new Error("Invalid menu item");
        }
        if (!menuItem.isActive) {
          throw new Error(`Menu item "${menuItem.name}" is no longer available`);
        }
        return {
          menuItemId: item.menuItemId,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
          totalPrice: menuItem.price * item.quantity,
          notes: item.notes,
        };
      })
    );

    const total = itemsWithServerPrices.reduce((sum, item) => sum + item.totalPrice, 0);
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
      itemsWithServerPrices.map((item) =>
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
    status: orderStatusValidator,
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    await requireRestaurantStaffAccess(ctx, order.restaurantId);

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return true;
  },
});
