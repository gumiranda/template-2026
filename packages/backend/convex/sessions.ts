import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession, batchFetchMenuItems, SESSION_DURATION_MS, isValidSessionId, validateQuantity } from "./lib/helpers";
import { validateMenuItemForCart } from "./lib/cartHelpers";
import { MAX_SESSIONS_PER_TABLE, MAX_SESSIONS_PER_DEVICE_PER_HOUR, MAX_CART_ITEM_QUANTITY } from "./lib/constants";
import { SessionStatus } from "./lib/types";
import { assertSessionCanAcceptChanges } from "./lib/sessionHelpers";

export const createSession = mutation({
  args: {
    sessionId: v.string(),
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!isValidSessionId(args.sessionId)) {
      throw new Error("Invalid session ID format: must be a valid UUID v4");
    }

    if (args.deviceId && !isValidSessionId(args.deviceId)) {
      throw new Error("Invalid device ID format: must be a valid UUID v4");
    }

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const table = await ctx.db.get(args.tableId);
    if (!table || table.restaurantId !== args.restaurantId) {
      throw new Error("Invalid table for this restaurant");
    }

    const now = Date.now();

    if (args.deviceId) {
      const existingDeviceSessions = await ctx.db
        .query("sessions")
        .withIndex("by_restaurantId_and_deviceId", (q) =>
          q.eq("restaurantId", args.restaurantId).eq("deviceId", args.deviceId)
        )
        .collect();

      const activeDeviceSession = existingDeviceSessions.find(
        (s) => s.status !== SessionStatus.CLOSED && s.expiresAt > now
      );

      if (activeDeviceSession && activeDeviceSession.tableId !== args.tableId) {
        throw new Error("ALREADY_AT_ANOTHER_TABLE");
      }

      if (activeDeviceSession && activeDeviceSession.tableId === args.tableId) {
        return { _id: activeDeviceSession._id, sessionId: activeDeviceSession.sessionId };
      }

      const oneHourAgo = now - 60 * 60 * 1000;
      const recentDeviceSessions = existingDeviceSessions.filter(
        (s) => s._creationTime > oneHourAgo
      );
      if (recentDeviceSessions.length >= MAX_SESSIONS_PER_DEVICE_PER_HOUR) {
        throw new Error("RATE_LIMITED");
      }
    }

    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing && existing.status !== SessionStatus.CLOSED) {
      return { _id: existing._id, sessionId: existing.sessionId };
    }

    if (existing) {
      throw new Error("SESSION_CLOSED");
    }

    const activeTableSessions = await ctx.db
      .query("sessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    const hasActiveSession = activeTableSessions.some(
      (s) => s.status !== SessionStatus.CLOSED && s.expiresAt > now
    );

    if (hasActiveSession) {
      throw new Error("TABLE_OCCUPIED");
    }

    const activeCount = activeTableSessions.filter((s) => s.expiresAt > now).length;
    if (activeCount >= MAX_SESSIONS_PER_TABLE) {
      throw new Error("Too many active sessions for this table. Please try again later.");
    }

    const newSessionId = await ctx.db.insert("sessions", {
      sessionId: args.sessionId,
      restaurantId: args.restaurantId,
      tableId: args.tableId,
      deviceId: args.deviceId,
      expiresAt: now + SESSION_DURATION_MS,
    });

    return { _id: newSessionId, sessionId: args.sessionId };
  },
});

export const getSessionCart = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await validateSession(ctx, args.sessionId, { allowClosed: true });

    if (session.status === SessionStatus.CLOSED) {
      return [];
    }

    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const menuMap = await batchFetchMenuItems(
      ctx,
      items.map((i) => i.menuItemId)
    );

    return items.map((item) => ({
      ...item,
      menuItem: menuMap.get(item.menuItemId.toString()) ?? null,
    }));
  },
});

const modifierValidator = v.object({
  groupName: v.string(),
  optionName: v.string(),
  price: v.number(),
});

type Modifier = { groupName: string; optionName: string; price: number };

function modifiersMatch(
  a: Modifier[] | undefined,
  b: Modifier[] | undefined
): boolean {
  const aList = a ?? [];
  const bList = b ?? [];
  if (aList.length !== bList.length) return false;
  return aList.every(
    (mod, i) =>
      mod.groupName === bList[i]?.groupName &&
      mod.optionName === bList[i]?.optionName
  );
}

export const addToSessionCart = mutation({
  args: {
    sessionId: v.string(),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    modifiers: v.optional(v.array(modifierValidator)),
  },
  handler: async (ctx, args) => {
    validateQuantity(args.quantity);

    const session = await validateSession(ctx, args.sessionId);
    assertSessionCanAcceptChanges(session, "add items");

    const menuItem = await validateMenuItemForCart(ctx, args.menuItemId, session.restaurantId);

    // Buscar todos os itens existentes para este menuItem
    const existingItems = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_sessionId_and_menuItemId", (q) =>
        q.eq("sessionId", args.sessionId).eq("menuItemId", args.menuItemId)
      )
      .collect();

    // Encontrar item com os mesmos modifiers
    const existing = existingItems.find((item) =>
      modifiersMatch(item.modifiers, args.modifiers)
    );

    if (existing) {
      const newQuantity = existing.quantity + args.quantity;
      if (newQuantity > MAX_CART_ITEM_QUANTITY) {
        throw new Error(`Cannot exceed ${MAX_CART_ITEM_QUANTITY} units per item`);
      }
      await ctx.db.patch(existing._id, {
        quantity: newQuantity,
      });
      return existing._id;
    }

    // Calcular preço com modifiers
    const modifiersTotal = (args.modifiers ?? []).reduce((sum, m) => sum + m.price, 0);

    return await ctx.db.insert("sessionCartItems", {
      sessionId: args.sessionId,
      menuItemId: args.menuItemId,
      quantity: args.quantity,
      price: menuItem.price + modifiersTotal,
      addedAt: Date.now(),
      modifiers: args.modifiers,
    });
  },
});

export const clearSessionCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    await validateSession(ctx, args.sessionId, { checkExpiry: false, allowClosed: true });

    const items = await ctx.db
      .query("sessionCartItems")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    return { deletedCount: items.length };
  },
});
