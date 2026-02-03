import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";
import { OrderStatus, OrderType, RestaurantStatus } from "./lib/types";
import { calculateDiscountedPrice } from "./lib/helpers";

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
    if (!restaurant || restaurant.deletedAt || restaurant.status !== RestaurantStatus.ACTIVE) {
      throw new Error("Restaurant not found or inactive");
    }

    if (args.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }
    if (args.items.length > 100) {
      throw new Error("Order cannot contain more than 100 items");
    }

    if (!args.deliveryAddress.trim()) {
      throw new Error("Delivery address is required");
    }

    // Validate items and calculate prices server-side
    let subtotalPrice = 0;
    let totalDiscounts = 0;

    const itemsWithServerPrices = await Promise.all(
      args.items.map(async (item) => {
        if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          throw new Error("Item quantity must be a positive integer");
        }

        const menuItem = await ctx.db.get(item.menuItemId);
        if (!menuItem || menuItem.restaurantId !== args.restaurantId) {
          throw new Error("Invalid menu item");
        }
        if (!menuItem.isActive) {
          throw new Error(`"${menuItem.name}" is no longer available`);
        }

        const originalTotal = menuItem.price * item.quantity;
        const discountPercentage = menuItem.discountPercentage ?? 0;
        const discountedPrice =
          discountPercentage > 0
            ? calculateDiscountedPrice(menuItem.price, discountPercentage)
            : menuItem.price;
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
        };
      })
    );

    const deliveryFee = restaurant.deliveryFee ?? 0;
    const total = subtotalPrice - totalDiscounts + deliveryFee;

    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId,
      userId: user._id,
      orderType: OrderType.DELIVERY,
      status: OrderStatus.PENDING,
      total,
      subtotalPrice,
      totalDiscounts,
      deliveryFee,
      deliveryAddress: args.deliveryAddress,
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

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Sort by most recent first
    orders.sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(
      orders.map(async (order) => {
        const restaurant = await ctx.db.get(order.restaurantId);
        const logoUrl =
          restaurant?.logoId
            ? await ctx.storage.getUrl(restaurant.logoId)
            : restaurant?.logoUrl ?? null;

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
    const logoUrl =
      restaurant?.logoId
        ? await ctx.storage.getUrl(restaurant.logoId)
        : restaurant?.logoUrl ?? null;

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
