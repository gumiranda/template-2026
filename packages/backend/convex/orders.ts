import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { OrderStatus } from "./lib/types";
import { getAuthenticatedUser, isRestaurantStaff } from "./lib/auth";

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
        quantity: v.number(),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify table belongs to restaurant
    const table = await ctx.db.get(args.tableId);
    if (!table || table.restaurantId !== args.restaurantId) {
      throw new Error("Invalid table");
    }

    // Fetch actual prices from database (SERVER-SIDE) and validate menu items
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

    // Calculate total from server prices
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
    // Authenticate user
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Validate status against OrderStatus enum
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(args.status as typeof validStatuses[number])) {
      throw new Error("Invalid status");
    }

    // Get order and verify it exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Authorization: Verify user is restaurant owner or staff
    const restaurant = await ctx.db.get(order.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const isOwner = restaurant.ownerId === user._id;
    const isStaff = isRestaurantStaff(user.role);

    if (!isOwner && !isStaff) {
      throw new Error("Not authorized to update order status");
    }

    // Perform update
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return true;
  },
});
