import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { OrderStatus, OrderType } from "./lib/types";
import type { OrderStatusType } from "./lib/types";
import { requireRestaurantStaffAccess } from "./lib/auth";
import { batchFetchTables, batchFetchMenuItems, validateSession, validateOrderItems, calculateDiscountedPrice } from "./lib/helpers";
import { orderStatusValidator } from "./schema";

const MAX_NOTES_LENGTH = 500;

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

    for (const item of args.items) {
      if (item.notes && item.notes.length > MAX_NOTES_LENGTH) {
        throw new Error(`Notes must be ${MAX_NOTES_LENGTH} characters or less`);
      }
    }

    const menuItemIds = args.items.map((item) => item.menuItemId);
    const menuMap = await batchFetchMenuItems(ctx, menuItemIds);

    let subtotalPrice = 0;
    let totalDiscounts = 0;

    const itemsWithServerPrices = args.items.map((item) => {
      const menuItem = menuMap.get(item.menuItemId.toString());
      if (!menuItem || menuItem.restaurantId !== args.restaurantId) {
        throw new Error("Invalid menu item");
      }
      if (!menuItem.isActive) {
        throw new Error(`Menu item "${menuItem.name}" is no longer available`);
      }

      const originalTotal = menuItem.price * item.quantity;
      const discountPercentage = menuItem.discountPercentage ?? 0;
      const discountedPrice = calculateDiscountedPrice(menuItem.price, discountPercentage);
      const discountedTotal = discountedPrice * item.quantity;
      const itemDiscount = originalTotal - discountedTotal;

      subtotalPrice += originalTotal;
      totalDiscounts += itemDiscount;

      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        quantity: item.quantity,
        price: discountedPrice,
        totalPrice: discountedTotal,
        notes: item.notes,
      };
    });

    const total = subtotalPrice - totalDiscounts;
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId,
      tableId: args.tableId,
      sessionId: args.sessionId,
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PENDING,
      total,
      subtotalPrice,
      totalDiscounts,
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
          notes: item.notes,
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
