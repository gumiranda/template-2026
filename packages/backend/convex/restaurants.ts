import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser, canModifyRestaurant, isAdmin } from "./lib/auth";
import { RestaurantStatus, OrderStatus } from "./lib/types";
import { groupBy } from "./lib/helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) return [];

    if (!isAdmin(currentUser.role)) {
      return await ctx.db
        .query("restaurants")
        .withIndex("by_owner", (q) => q.eq("ownerId", currentUser._id))
        .collect();
    }

    return await ctx.db.query("restaurants").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    subdomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedUser(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (!isAdmin(identity.role)) {
      throw new Error("Only admins can create restaurants");
    }

    if (args.subdomain) {
      const existing = await ctx.db
        .query("restaurants")
        .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
        .first();
      if (existing) {
        throw new Error("Subdomain already in use");
      }
    }

    return ctx.db.insert("restaurants", {
      name: args.name,
      address: args.address,
      phone: args.phone,
      description: args.description,
      subdomain: args.subdomain,
      status: RestaurantStatus.ACTIVE,
      ownerId: identity._id,
      isActive: true,
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

    return await ctx.db.delete(args.id);
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

    if (!canModifyRestaurant(currentUser, restaurant)) {
      return null;
    }

    return {
      _id: restaurant._id,
      _creationTime: restaurant._creationTime,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      subdomain: restaurant.subdomain,
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
    return await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", currentUser._id))
      .collect();
  },
});

export const listAllWithStats = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) {
      return [];
    }

    const restaurants = await ctx.db.query("restaurants").collect();

    const completedOrders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("status"), OrderStatus.COMPLETED))
      .collect();

    const revenueByRestaurant = groupBy(completedOrders, (order) =>
      order.restaurantId.toString()
    );

    const restaurantsWithStats = restaurants.map((restaurant) => {
      const restaurantOrders = revenueByRestaurant.get(restaurant._id.toString()) ?? [];
      const totalRevenue = restaurantOrders.reduce((sum, order) => sum + order.total, 0);

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
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
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

    const activeRestaurantsList = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", RestaurantStatus.ACTIVE))
      .collect();
    const activeRestaurants = activeRestaurantsList.length;

    const allRestaurants = await ctx.db.query("restaurants").collect();
    const totalRestaurants = allRestaurants.length;
    const legacyActiveCount = allRestaurants.filter((r) => r.status === undefined).length;

    const now = Date.now();
    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires_at", (q) => q.gt("expiresAt", now))
      .collect();
    const activeSessionsCount = activeSessions.length;

    const allCompletedOrders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("status"), OrderStatus.COMPLETED))
      .collect();
    const totalRevenue = allCompletedOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      totalRestaurants,
      activeRestaurants: activeRestaurants + legacyActiveCount,
      activeSessions: activeSessionsCount,
      totalRevenue,
    };
  },
});
