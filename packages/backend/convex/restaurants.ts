import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser, canModifyRestaurant, isAdmin } from "./lib/auth";
import { RestaurantStatus } from "./lib/types";

export const list = query({
  args: {},
  handler: async (ctx) => {
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
    const restaurant = await ctx.db.get(args.id);
    if (!restaurant) return null;

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

    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
          .collect();

        const totalRevenue = orders
          .filter((order) => order.status === "completed")
          .reduce((sum, order) => sum + order.total, 0);

        return {
          ...restaurant,
          totalRevenue,
        };
      })
    );

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

    const restaurants = await ctx.db.query("restaurants").collect();
    const totalRestaurants = restaurants.length;

    const activeRestaurants = restaurants.filter(
      (r) => r.status === RestaurantStatus.ACTIVE || r.status === undefined
    ).length;

    const now = Date.now();
    const sessions = await ctx.db.query("sessions").collect();
    const activeSessions = sessions.filter((s) => s.expiresAt > now).length;

    const orders = await ctx.db.query("orders").collect();
    const totalRevenue = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.total, 0);

    return {
      totalRestaurants,
      activeRestaurants,
      activeSessions,
      totalRevenue,
    };
  },
});
