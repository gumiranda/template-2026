import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthenticatedUser, canModifyRestaurant, canViewRestaurant, isAdmin } from "./lib/auth";
import { RestaurantStatus, OrderStatus } from "./lib/types";
import { groupBy, calculateTotalRevenue } from "./lib/helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) return [];

    if (!isAdmin(currentUser.role)) {
      const restaurants = await ctx.db
        .query("restaurants")
        .withIndex("by_owner", (q) => q.eq("ownerId", currentUser._id))
        .collect();
      return restaurants.filter((r) => r.deletedAt === undefined);
    }

    const restaurants = await ctx.db.query("restaurants").collect();
    return restaurants.filter((r) => r.deletedAt === undefined);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedUser(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (!isAdmin(identity.role)) {
      throw new Error("Only admins can create restaurants");
    }

    return ctx.db.insert("restaurants", {
      name: args.name,
      address: args.address,
      phone: args.phone,
      description: args.description,
      status: RestaurantStatus.ACTIVE,
      ownerId: identity._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("restaurants"),
    options: v.object({
      name: v.string(),
      address: v.string(),
      phone: v.string(),
      description: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("Not authenticated");

    const restaurant = await ctx.db.get(args.id);
    if (!restaurant) throw new Error("Restaurant not found");

    if (!canModifyRestaurant(currentUser, restaurant)) {
      throw new Error("Not authorized to update this restaurant");
    }

    return await ctx.db.patch(args.id, args.options);
  },
});

export const deleteRestaurant = mutation({
  args: {
    id: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("Not authenticated");

    const restaurant = await ctx.db.get(args.id);
    if (!restaurant) throw new Error("Restaurant not found");

    if (!canModifyRestaurant(currentUser, restaurant)) {
      throw new Error("Not authorized to delete this restaurant");
    }

    if (restaurant.deletedAt) {
      throw new Error("Restaurant already deleted");
    }

    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: currentUser._id,
      status: RestaurantStatus.INACTIVE,
    });
  },
});

export const get = query({
  args: {
    id: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) return null;

    const restaurant = await ctx.db.get(args.id);
    if (!restaurant) return null;

    if (!canViewRestaurant(currentUser, restaurant)) {
      return null;
    }

    return {
      _id: restaurant._id,
      _creationTime: restaurant._creationTime,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      status: restaurant.status,
      isActive: restaurant.isActive,
    };
  },
});

export const listMyRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) return [];
    const restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", currentUser._id))
      .collect();
    return restaurants.filter((r) => r.deletedAt === undefined);
  },
});

export const listAllWithStats = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) {
      return [];
    }

    const allRestaurants = await ctx.db.query("restaurants").collect();
    const restaurants = allRestaurants.filter((r) => r.deletedAt === undefined);

    const completedOrders = await ctx.db
      .query("orders")
      .withIndex("by_order_status", (q) => q.eq("status", OrderStatus.COMPLETED))
      .collect();

    const revenueByRestaurant = groupBy(completedOrders, (order) =>
      order.restaurantId.toString()
    );

    const restaurantsWithStats = restaurants.map((restaurant) => {
      const restaurantOrders = revenueByRestaurant.get(restaurant._id.toString()) ?? [];
      const totalRevenue = calculateTotalRevenue(restaurantOrders);

      return {
        ...restaurant,
        totalRevenue,
      };
    });

    return restaurantsWithStats;
  },
});

export const getWithStats = query({
  args: {
    id: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) {
      return null;
    }

    const restaurant = await ctx.db.get(args.id);
    if (!restaurant) return null;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const completedOrders = orders.filter((order) => order.status === "completed");
    const totalRevenue = calculateTotalRevenue(completedOrders);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "pending").length;

    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    return {
      ...restaurant,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders: completedOrders.length,
        tablesCount: tables.length,
        menuItemsCount: menuItems.length,
      },
    };
  },
});

export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) {
      return null;
    }

    const allRestaurants = await ctx.db.query("restaurants").collect();
    const totalRestaurants = allRestaurants.length;
    const activeRestaurants = allRestaurants.filter(
      (r) => r.status === RestaurantStatus.ACTIVE || r.status === undefined
    ).length;

    const now = Date.now();
    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires_at", (q) => q.gt("expiresAt", now))
      .collect();

    const allCompletedOrders = await ctx.db
      .query("orders")
      .withIndex("by_order_status", (q) => q.eq("status", OrderStatus.COMPLETED))
      .collect();
    const totalRevenue = calculateTotalRevenue(allCompletedOrders);

    return {
      totalRestaurants,
      activeRestaurants,
      activeSessions: activeSessions.length,
      totalRevenue,
    };
  },
});

export const migrateRestaurantStatus = internalMutation({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db.query("restaurants").collect();
    let migratedCount = 0;

    for (const restaurant of restaurants) {
      if (restaurant.status === undefined) {
        await ctx.db.patch(restaurant._id, { status: RestaurantStatus.ACTIVE });
        migratedCount++;
      }
    }

    return { migratedCount };
  },
});
