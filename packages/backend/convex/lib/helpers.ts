import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";
import { resolveImageUrl, resolveStorageUrl } from "./storage";
import { RestaurantStatus, SessionStatus } from "./types";
import { MAX_ORDER_ITEMS, VALID_ICON_IDS, MAX_ICON_LENGTH } from "./constants";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CONVEX_ID_REGEX = /^[a-z][a-z0-9]{31}$/;

// Stripe ID format: prefix_[alphanumeric 14+ chars]
const STRIPE_PRICE_ID_REGEX = /^price_[a-zA-Z0-9]{14,}$/;
const STRIPE_CUSTOMER_ID_REGEX = /^cus_[a-zA-Z0-9]{14,}$/;

export function validateStripePriceId(id: string): boolean {
  return STRIPE_PRICE_ID_REGEX.test(id);
}

export function validateStripeCustomerId(id: string): boolean {
  return STRIPE_CUSTOMER_ID_REGEX.test(id);
}

export function validateIcon(icon: string | undefined): string | undefined {
  if (icon === undefined) return undefined;
  const trimmed = icon.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_ICON_LENGTH || !VALID_ICON_IDS.includes(trimmed as typeof VALID_ICON_IDS[number])) {
    throw new Error("Invalid icon ID");
  }
  return trimmed;
}

export function isValidSessionId(sessionId: string): boolean {
  return UUID_REGEX.test(sessionId);
}

export function isValidConvexId(id: string): boolean {
  return CONVEX_ID_REGEX.test(id);
}

export function isValidRestaurantId(id: string): id is Id<"restaurants"> {
  return CONVEX_ID_REGEX.test(id);
}

export function isValidMenuItemId(id: string): id is Id<"menuItems"> {
  return CONVEX_ID_REGEX.test(id);
}

export function isValidFoodCategoryId(id: string): id is Id<"foodCategories"> {
  return CONVEX_ID_REGEX.test(id);
}

type ValidateSessionOptions = {
  checkExpiry?: boolean;
  allowClosed?: boolean;
};

export async function validateSession(
  ctx: QueryCtx | MutationCtx,
  sessionId: string,
  options: ValidateSessionOptions = {}
): Promise<Doc<"sessions">> {
  const { checkExpiry = true, allowClosed = false } = options;

  // Validate session ID format to prevent enumeration attacks
  if (!isValidSessionId(sessionId)) {
    throw new Error("Invalid session ID format");
  }

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
    .first();

  if (!session) throw new Error("Invalid session");
  if (checkExpiry && session.expiresAt < Date.now()) throw new Error("Session expired");
  if (!allowClosed && session.status === SessionStatus.CLOSED) {
    throw new Error("Session is closed");
  }
  return session;
}

export async function batchFetchMenuItems(
  ctx: QueryCtx | MutationCtx,
  menuItemIds: Id<"menuItems">[]
): Promise<Map<string, Doc<"menuItems">>> {
  const uniqueIds = [...new Set(menuItemIds)];
  const menuItems = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));

  const menuMap = new Map<string, Doc<"menuItems">>();
  uniqueIds.forEach((id, i) => {
    const item = menuItems[i];
    if (item) menuMap.set(id.toString(), item);
  });

  return menuMap;
}

export async function batchFetchTables(
  ctx: QueryCtx | MutationCtx,
  tableIds: Id<"tables">[]
): Promise<Map<string, Doc<"tables">>> {
  const uniqueIds = [...new Set(tableIds)];
  const tables = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));

  const tableMap = new Map<string, Doc<"tables">>();
  uniqueIds.forEach((id, i) => {
    const table = tables[i];
    if (table) tableMap.set(id.toString(), table);
  });

  return tableMap;
}

export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

export { SESSION_DURATION_MS, MAX_ORDER_ITEMS } from "./constants";

export function validateQuantity(quantity: number): void {
  if (quantity <= 0 || !Number.isInteger(quantity)) {
    throw new Error("Quantity must be a positive integer");
  }
}

export function validateOrderItems(
  items: Array<{ quantity: number }>,
): void {
  if (items.length === 0) {
    throw new Error("Order must contain at least one item");
  }
  if (items.length > MAX_ORDER_ITEMS) {
    throw new Error(`Order cannot contain more than ${MAX_ORDER_ITEMS} items`);
  }
  for (const item of items) {
    validateQuantity(item.quantity);
  }
}

export function calculateTotalRevenue(orders: Array<{ total: number }>): number {
  return orders.reduce((sum, order) => sum + order.total, 0);
}

export function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  if (discountPercentage <= 0 || discountPercentage > 100) return price;
  return Math.round(price * (1 - discountPercentage / 100));
}

export function isActiveRestaurant(
  restaurant: Doc<"restaurants"> | null
): restaurant is Doc<"restaurants"> {
  return (
    restaurant !== null &&
    !restaurant.deletedAt &&
    restaurant.status === RestaurantStatus.ACTIVE
  );
}

export function filterUndefined(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

export async function fetchModifierGroupsWithOptions(
  ctx: QueryCtx,
  menuItemId: Id<"menuItems">
) {
  const modifierGroups = await ctx.db
    .query("modifierGroups")
    .withIndex("by_menuItem", (q) => q.eq("menuItemId", menuItemId))
    .collect();

  const groupsWithOptions = await Promise.all(
    modifierGroups.map(async (group) => {
      const options = await ctx.db
        .query("modifierOptions")
        .withIndex("by_modifierGroup", (q) =>
          q.eq("modifierGroupId", group._id)
        )
        .collect();
      return {
        ...group,
        options: options.sort((a, b) => a.order - b.order),
      };
    })
  );

  return groupsWithOptions.sort((a, b) => a.order - b.order);
}

export async function toPublicRestaurant(
  ctx: QueryCtx,
  restaurant: Doc<"restaurants">
) {
  const logoUrl = await resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl);
  const coverImageUrl = await resolveStorageUrl(ctx, restaurant.coverImageId);

  return {
    _id: restaurant._id,
    name: restaurant.name,
    slug: restaurant.slug,
    address: restaurant.address,
    description: restaurant.description,
    logoUrl,
    coverImageUrl,
    deliveryFee: restaurant.deliveryFee ?? 0,
    deliveryTimeMinutes: restaurant.deliveryTimeMinutes ?? 30,
    rating: restaurant.rating ?? 0,
  };
}
