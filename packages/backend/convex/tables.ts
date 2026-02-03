import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  getAuthenticatedUser,
  isRestaurantStaff,
  canManageRestaurant,
  requireRestaurantAccess,
} from "./lib/auth";
import { batchFetchMenuItems, groupBy } from "./lib/helpers";
import { OrderStatus } from "./lib/types";

const MAX_RECENT_ORDERS = 10;

// NOTE: This query is intentionally public (no auth check) to support the
// QR code flow where unauthenticated customers scan a table's QR code and
// need to see table info. Only public fields are returned (no qrCode).
export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    return tables.map((table) => ({
      _id: table._id,
      _creationTime: table._creationTime,
      restaurantId: table.restaurantId,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      isActive: table.isActive,
    }));
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
      .withIndex("by_restaurantId_and_isActive", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("isActive", true)
      )
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
    const ordersWithTable = allOrders.filter((o) => o.tableId !== undefined);
    const ordersByTable = groupBy(ordersWithTable, (o) => o.tableId!.toString());

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

    const tableNumber = args.tableNumber.trim();
    if (!tableNumber || tableNumber.length > 50) {
      throw new Error("Table number must be between 1 and 50 characters");
    }

    if (!Number.isInteger(args.capacity) || args.capacity < 1) {
      throw new Error("Capacity must be a positive integer");
    }

    // Validate qrCode is a proper HTTP(S) URL to prevent javascript: injection
    try {
      const parsed = new URL(args.qrCode);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("Invalid protocol");
      }
    } catch {
      throw new Error("qrCode must be a valid HTTP or HTTPS URL");
    }

    return await ctx.db.insert("tables", {
      ...args,
      tableNumber,
    });
  },
});

export const getTableStats = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can view table stats");
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

    const totalTables = tables.length;
    const activeTables = tables.filter((t) => t.isActive).length;
    const inactiveTables = totalTables - activeTables;

    return {
      totalTables,
      activeTables,
      inactiveTables,
    };
  },
});

export const listTablesWithQR = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can view tables");
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

    return tables.map((table) => ({
      _id: table._id,
      _creationTime: table._creationTime,
      restaurantId: table.restaurantId,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      isActive: table.isActive,
      qrCode: table.qrCode,
    }));
  },
});

export const getTableAnalytics = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) {
      throw new Error("Unauthorized: Only restaurant staff can view table analytics");
    }

    const canAccess = await canManageRestaurant(ctx, user._id, table.restaurantId);
    if (!canAccess) {
      throw new Error("Not authorized to access this table's analytics");
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status === OrderStatus.COMPLETED)
      .reduce((sum, o) => sum + o.total, 0);

    const ordersByStatus = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_RECENT_ORDERS)
      .map((order) => ({
        _id: order._id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      }));

    const completedCount = orders.filter((o) => o.status === OrderStatus.COMPLETED).length;
    const avgOrderValue =
      completedCount > 0 ? totalRevenue / completedCount : 0;

    return {
      table: {
        _id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        isActive: table.isActive,
      },
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      recentOrders,
    };
  },
});

export const batchCreateTables = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    startId: v.number(),
    endId: v.number(),
    baseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    // Validate baseUrl is a proper HTTP(S) URL to prevent injection
    try {
      const parsed = new URL(args.baseUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("Invalid protocol");
      }
    } catch {
      throw new Error("baseUrl must be a valid HTTP or HTTPS URL");
    }

    if (!Number.isInteger(args.startId) || args.startId < 1) {
      throw new Error("Start ID must be a positive integer");
    }
    if (!Number.isInteger(args.endId) || args.endId < args.startId) {
      throw new Error("End ID must be an integer greater than or equal to Start ID");
    }
    const count = args.endId - args.startId + 1;
    if (count > 50) {
      throw new Error("Cannot create more than 50 tables at once");
    }

    const existingTables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const existingNumbers = new Set(existingTables.map((t) => t.tableNumber));

    const createdIds: string[] = [];
    const skippedNumbers: number[] = [];

    for (let i = args.startId; i <= args.endId; i++) {
      const tableNumber = i.toString();
      if (existingNumbers.has(tableNumber)) {
        skippedNumbers.push(i);
        continue;
      }

      const qrCode = `${args.baseUrl}/menu/${args.restaurantId}?table=${encodeURIComponent(tableNumber)}`;

      const id = await ctx.db.insert("tables", {
        restaurantId: args.restaurantId,
        tableNumber,
        capacity: 4,
        qrCode,
        isActive: true,
      });
      createdIds.push(id);
    }

    return {
      created: createdIds.length,
      skipped: skippedNumbers,
    };
  },
});

export const updateTable = mutation({
  args: {
    tableId: v.id("tables"),
    isActive: v.optional(v.boolean()),
    capacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    await requireRestaurantAccess(ctx, table.restaurantId);

    if (args.capacity !== undefined && (!Number.isInteger(args.capacity) || args.capacity < 1)) {
      throw new Error("Capacity must be a positive integer");
    }

    const updates: Partial<Doc<"tables">> = {};
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.capacity !== undefined) updates.capacity = args.capacity;

    await ctx.db.patch(args.tableId, updates);
    return { success: true };
  },
});

export const deleteTable = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    await requireRestaurantAccess(ctx, table.restaurantId);

    const now = Date.now();
    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    const hasActiveSessions = activeSessions.some((s) => s.expiresAt > now);

    if (hasActiveSessions) {
      throw new Error("Cannot delete table with active sessions");
    }

    await ctx.db.delete(args.tableId);
    return { success: true };
  },
});

export const toggleTableStatus = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    await requireRestaurantAccess(ctx, table.restaurantId);

    await ctx.db.patch(args.tableId, { isActive: !table.isActive });
    return { success: true, isActive: !table.isActive };
  },
});
