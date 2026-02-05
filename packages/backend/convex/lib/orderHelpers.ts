import type { MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";
import { batchFetchMenuItems, calculateDiscountedPrice, validateOrderItems } from "./helpers";
import { OrderStatus } from "./types";
import { MAX_NOTES_LENGTH } from "./constants";

export type OrderItemInput = {
  menuItemId: Id<"menuItems">;
  quantity: number;
  notes?: string;
};

export type PricedOrderItem = {
  menuItemId: Id<"menuItems">;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  notes?: string;
};

export type PriceResult = {
  items: PricedOrderItem[];
  subtotalPrice: number;
  totalDiscounts: number;
};

/**
 * Validates order items and calculates server-side prices.
 * Throws if any item is invalid, inactive, or doesn't belong to the restaurant.
 */
export async function priceOrderItems(
  ctx: MutationCtx,
  restaurantId: Id<"restaurants">,
  items: OrderItemInput[]
): Promise<PriceResult> {
  validateOrderItems(items);

  for (const item of items) {
    if (item.notes && item.notes.length > MAX_NOTES_LENGTH) {
      throw new Error(`Notes must be ${MAX_NOTES_LENGTH} characters or less`);
    }
  }

  const menuItemIds = items.map((item) => item.menuItemId);
  const menuMap = await batchFetchMenuItems(ctx, menuItemIds);

  let subtotalPrice = 0;
  let totalDiscounts = 0;

  const pricedItems = items.map((item) => {
    const menuItem = menuMap.get(item.menuItemId.toString());
    if (!menuItem) {
      throw new Error(`Menu item ${item.menuItemId} not found`);
    }
    if (menuItem.restaurantId !== restaurantId) {
      throw new Error(`Menu item "${menuItem.name}" is not available at this restaurant`);
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

  return {
    items: pricedItems,
    subtotalPrice,
    totalDiscounts,
  };
}

export type InsertOrderData = {
  restaurantId: Id<"restaurants">;
  orderType: Doc<"orders">["orderType"];
  status?: Doc<"orders">["status"];
  subtotalPrice: number;
  totalDiscounts: number;
  total: number;
  // Optional fields for different order types
  tableId?: Id<"tables">;
  sessionId?: string;
  userId?: Id<"users">;
  deliveryFee?: number;
  deliveryAddress?: string;
};

/**
 * Inserts an order and its items into the database.
 * Returns the created order ID.
 */
export async function insertOrderWithItems(
  ctx: MutationCtx,
  orderData: InsertOrderData,
  items: PricedOrderItem[]
): Promise<Id<"orders">> {
  const now = Date.now();

  const orderId = await ctx.db.insert("orders", {
    restaurantId: orderData.restaurantId,
    orderType: orderData.orderType,
    status: orderData.status ?? OrderStatus.PENDING,
    total: orderData.total,
    subtotalPrice: orderData.subtotalPrice,
    totalDiscounts: orderData.totalDiscounts,
    tableId: orderData.tableId,
    sessionId: orderData.sessionId,
    userId: orderData.userId,
    deliveryFee: orderData.deliveryFee,
    deliveryAddress: orderData.deliveryAddress,
    createdAt: now,
    updatedAt: now,
  });

  await Promise.all(
    items.map((item) =>
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
}
