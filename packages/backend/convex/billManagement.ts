import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession, isValidSessionId } from "./lib/helpers";
import { requireRestaurantStaffAccess } from "./lib/auth";
import { SessionStatus, OrderStatus } from "./lib/types";

// ─── Client Mutations ─────────────────────────────────────────────────────────

export const requestCloseBill = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionId);

    if (session.status === SessionStatus.CLOSED) {
      throw new Error("Session is already closed");
    }

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

    if (session.status === SessionStatus.CLOSED) {
      throw new Error("Session is already closed");
    }

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
    // Validate staff access
    const user = await requireRestaurantStaffAccess(ctx, args.restaurantId);

    // Validate session (allow closed to prevent race conditions, but check after)
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

    // Mark all non-finalized orders as completed
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const finalStatuses = [OrderStatus.COMPLETED, OrderStatus.CANCELED];
    const ordersToUpdate = orders.filter(
      (order) => !finalStatuses.includes(order.status as typeof OrderStatus.COMPLETED | typeof OrderStatus.CANCELED)
    );

    await Promise.all(
      ordersToUpdate.map((order) =>
        ctx.db.patch(order._id, {
          status: OrderStatus.COMPLETED,
          updatedAt: Date.now(),
        })
      )
    );

    // Clear session cart items
    const cartItems = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));

    // Mark session as closed
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
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_restaurantId_and_status", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("status", SessionStatus.REQUESTING_CLOSURE)
      )
      .collect();

    // Get table info and orders for each session
    const results = await Promise.all(
      sessions.map(async (session) => {
        const table = await ctx.db.get(session.tableId);
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_session", (q) => q.eq("sessionId", session.sessionId))
          .collect();

        const total = orders
          .filter((o) => o.status !== OrderStatus.CANCELED)
          .reduce((sum, o) => sum + o.total, 0);

        return {
          sessionId: session.sessionId,
          tableId: session.tableId,
          tableNumber: table?.tableNumber ?? "?",
          total,
          orderCount: orders.length,
          requestedAt: session._creationTime,
        };
      })
    );

    return results.sort((a, b) => a.requestedAt - b.requestedAt);
  },
});

export const getTableSessions = query({
  args: {
    tableId: v.id("tables"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Filter out closed sessions and return active ones
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
