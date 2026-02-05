import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";
import { OrderType } from "./lib/types";
import { isActiveRestaurant } from "./lib/helpers";
import { priceOrderItems, insertOrderWithItems } from "./lib/orderHelpers";
import { resolveImageUrl } from "./files";
import { MAX_USER_ORDERS, MAX_ADDRESS_LENGTH } from "./lib/constants";

export const createDeliveryOrder = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    deliveryAddress: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!isActiveRestaurant(restaurant)) {
      throw new Error("Restaurant not found or inactive");
    }

    if (!args.deliveryAddress.trim()) {
      throw new Error("Delivery address is required");
    }
    if (args.deliveryAddress.length > MAX_ADDRESS_LENGTH) {
      throw new Error(`Delivery address must be ${MAX_ADDRESS_LENGTH} characters or less`);
    }

    const priceResult = await priceOrderItems(ctx, args.restaurantId, args.items);
    const deliveryFee = restaurant.deliveryFee ?? 0;
    const total = priceResult.subtotalPrice - priceResult.totalDiscounts + deliveryFee;

    return insertOrderWithItems(
      ctx,
      {
        restaurantId: args.restaurantId,
        userId: user._id,
        orderType: OrderType.DELIVERY,
        subtotalPrice: priceResult.subtotalPrice,
        totalDiscounts: priceResult.totalDiscounts,
        deliveryFee,
        deliveryAddress: args.deliveryAddress,
        total,
      },
      priceResult.items
    );
  },
});

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(MAX_USER_ORDERS);

    // Sort by most recent first
    orders.sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(
      orders.map(async (order) => {
        const restaurant = await ctx.db.get(order.restaurantId);
        const logoUrl = restaurant
          ? await resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl)
          : null;

        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();

        return {
          _id: order._id,
          status: order.status,
          orderType: order.orderType,
          total: order.total,
          subtotalPrice: order.subtotalPrice,
          totalDiscounts: order.totalDiscounts,
          deliveryFee: order.deliveryFee,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt,
          restaurant: restaurant
            ? { _id: restaurant._id, name: restaurant.name, logoUrl }
            : null,
          items,
        };
      })
    );
  },
});

export const getMyOrderDetails = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== user._id) return null;

    const restaurant = await ctx.db.get(order.restaurantId);
    const logoUrl = restaurant
      ? await resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl)
      : null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .collect();

    return {
      ...order,
      restaurant: restaurant
        ? {
            _id: restaurant._id,
            name: restaurant.name,
            logoUrl,
            address: restaurant.address,
            phone: restaurant.phone,
          }
        : null,
      items,
    };
  },
});
