import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { OrderStatus, OrderType, SessionStatus } from "./lib/types";
import type { OrderStatusType } from "./lib/types";
import { requireRestaurantStaffAccess } from "./lib/auth";
import { batchFetchTables, validateSession, isValidSessionId } from "./lib/helpers";
import { priceOrderItems, insertOrderWithItems } from "./lib/orderHelpers";
import { orderStatusValidator } from "./schema";

const MAX_SESSION_ORDERS = 50;

const VALID_STATUS_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELED],
  [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.DELIVERING, OrderStatus.CANCELED],
  [OrderStatus.SERVED]: [OrderStatus.COMPLETED],
  [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED, OrderStatus.CANCELED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELED]: [],
};

export const getOrdersByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantStaffAccess(ctx, args.restaurantId);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    // Get all unique session IDs from orders
    const sessionIds = [...new Set(
      orders
        .map((o) => o.sessionId)
        .filter((id): id is string => id !== undefined)
    )];

    // Fetch sessions to get their status
    const sessions = await Promise.all(
      sessionIds.map((sessionId) =>
        ctx.db
          .query("sessions")
          .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
          .first()
      )
    );

    // Build a map of session status
    const sessionStatusMap = new Map<string, string>();
    sessions.forEach((s) => {
      if (s) sessionStatusMap.set(s.sessionId, s.status ?? "open");
    });

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
      sessionStatus: order.sessionId
        ? sessionStatusMap.get(order.sessionId) ?? "open"
        : null,
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

    const priceResult = await priceOrderItems(ctx, args.restaurantId, args.items);
    const total = priceResult.subtotalPrice - priceResult.totalDiscounts;

    return insertOrderWithItems(
      ctx,
      {
        restaurantId: args.restaurantId,
        tableId: args.tableId,
        sessionId: args.sessionId,
        orderType: OrderType.DINE_IN,
        subtotalPrice: priceResult.subtotalPrice,
        totalDiscounts: priceResult.totalDiscounts,
        total,
      },
      priceResult.items
    );
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

    const currentStatus = order.status;
    const newStatus = args.status;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: cannot change from "${currentStatus}" to "${newStatus}"`
      );
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const getSessionOrders = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    if (!isValidSessionId(args.sessionId)) {
      throw new Error("Invalid session ID format");
    }

    // Allow viewing orders even with expired or closed session
    await validateSession(ctx, args.sessionId, { checkExpiry: false, allowClosed: true });

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .take(MAX_SESSION_ORDERS);

    const sorted = [...orders].sort((a, b) => b.createdAt - a.createdAt);

    const ordersWithItems = await Promise.all(
      sorted.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();

        return {
          _id: order._id,
          status: order.status,
          total: order.total,
          subtotalPrice: order.subtotalPrice,
          totalDiscounts: order.totalDiscounts,
          createdAt: order.createdAt,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        };
      })
    );

    return ordersWithItems;
  },
});
