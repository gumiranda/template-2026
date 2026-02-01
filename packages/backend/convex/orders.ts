import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { OrderStatus, isValidOrderStatus, Role } from "./lib/types";
import { getAuthenticatedUser, isRestaurantStaff } from "./lib/auth";
import { batchFetchTables, validateSession } from "./lib/helpers";

export const getOrdersByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can view orders");
    }

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    if (user.role !== Role.SUPERADMIN && restaurant.ownerId !== user._id) {
      throw new Error("Not authorized to access this restaurant's orders");
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    const tableMap = await batchFetchTables(
      ctx,
      orders.map((o) => o.tableId)
    );

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

    // Validate items array
    if (args.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    // Validate quantities are positive
    for (const item of args.items) {
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new Error("Item quantity must be a positive integer");
      }
    }

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
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can update orders");
    }

    if (!isValidOrderStatus(args.status)) {
      throw new Error("Invalid status");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const restaurant = await ctx.db.get(order.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    if (user.role !== Role.SUPERADMIN && restaurant.ownerId !== user._id) {
      throw new Error("Not authorized to update this restaurant's orders");
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return true;
  },
});
