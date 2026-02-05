import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession, isValidSessionId } from "./lib/helpers";
import { requireRestaurantStaffAccess } from "./lib/auth";
import { SessionStatus, OrderStatus } from "./lib/types";
import { assertSessionNotClosed } from "./lib/sessionHelpers";

// ─── Client Mutations ─────────────────────────────────────────────────────────

export const requestCloseBill = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionId);
    assertSessionNotClosed(session, "request bill closure");

    if (session.status === SessionStatus.REQUESTING_CLOSURE) {
      return { success: true, alreadyRequesting: true };
    }

    await ctx.db.patch(session._id, {
      status: SessionStatus.REQUESTING_CLOSURE,
    });

    return { success: true, alreadyRequesting: false };
  },
});

export const cancelCloseBillRequest = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionId);
    assertSessionNotClosed(session, "cancel bill request");

    if (session.status !== SessionStatus.REQUESTING_CLOSURE) {
      return { success: true, wasNotRequesting: true };
    }

    await ctx.db.patch(session._id, {
      status: SessionStatus.OPEN,
    });

    return { success: true, wasNotRequesting: false };
  },
});

// ─── Staff Mutations ──────────────────────────────────────────────────────────

export const settleBill = mutation({
  args: {
    sessionId: v.string(),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const user = await requireRestaurantStaffAccess(ctx, args.restaurantId);

    if (!isValidSessionId(args.sessionId)) {
      throw new Error("Invalid session ID format");
    }

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.restaurantId !== args.restaurantId) {
      throw new Error("Session does not belong to this restaurant");
    }

    if (session.status === SessionStatus.CLOSED) {
      return { success: true, alreadyClosed: true };
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const finalStatuses: string[] = [OrderStatus.COMPLETED, OrderStatus.CANCELED];
    const ordersToUpdate = orders.filter(
      (order) =>
        order.restaurantId === args.restaurantId &&
        !finalStatuses.includes(order.status)
    );

    await Promise.all(
      ordersToUpdate.map((order) =>
        ctx.db.patch(order._id, {
          status: OrderStatus.COMPLETED,
          updatedAt: Date.now(),
        })
      )
    );

    const cartItems = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));

    await ctx.db.patch(session._id, {
      status: SessionStatus.CLOSED,
      closedAt: Date.now(),
      closedBy: user._id,
    });

    return {
      success: true,
      alreadyClosed: false,
      ordersCompleted: ordersToUpdate.length,
      cartItemsCleared: cartItems.length,
    };
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getSessionStatus = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidSessionId(args.sessionId)) {
      return null;
    }

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return null;
    }

    return {
      status: session.status ?? SessionStatus.OPEN,
      closedAt: session.closedAt,
    };
  },
});

export const getBillRequests = query({
  args: {
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    await requireRestaurantStaffAccess(ctx, args.restaurantId);

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_restaurantId_and_status", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("status", SessionStatus.REQUESTING_CLOSURE)
      )
      .collect();

    if (sessions.length === 0) {
      return [];
    }

    // Batch fetch tables
    const tableIds = [...new Set(sessions.map((s) => s.tableId))];
    const tables = await Promise.all(tableIds.map((id) => ctx.db.get(id)));
    const tableMap = new Map(
      tableIds
        .map((id, i) => [id.toString(), tables[i]] as const)
        .filter(([, table]) => table !== null)
    );

    // Batch fetch orders for all sessions
    const ordersPromises = sessions.map((session) =>
      ctx.db
        .query("orders")
        .withIndex("by_session", (q) => q.eq("sessionId", session.sessionId))
        .collect()
    );
    const ordersPerSession = await Promise.all(ordersPromises);

    const results = sessions.map((session, index) => {
      const table = tableMap.get(session.tableId.toString());
      if (!table) {
        throw new Error(`Table ${session.tableId} not found for session ${session.sessionId}`);
      }

      const orders = ordersPerSession[index] ?? [];
      const total = orders
        .filter((o) => o.status !== OrderStatus.CANCELED)
        .reduce((sum, o) => sum + o.total, 0);

      return {
        sessionId: session.sessionId,
        tableId: session.tableId,
        tableNumber: table.tableNumber,
        total,
        orderCount: orders.length,
        requestedAt: session._creationTime,
      };
    });

    return results.sort((a, b) => a.requestedAt - b.requestedAt);
  },
});

export const getTableSessions = query({
  args: {
    tableId: v.id("tables"),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }
    await requireRestaurantStaffAccess(ctx, table.restaurantId);

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    return sessions
      .filter((s) => s.status !== SessionStatus.CLOSED)
      .map((session) => ({
        sessionId: session.sessionId,
        status: session.status ?? SessionStatus.OPEN,
        createdAt: session._creationTime,
        expiresAt: session.expiresAt,
      }));
  },
});
