import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthenticatedUser, canModifyRestaurant, canViewRestaurant, isAdmin } from "./lib/auth";
import { RestaurantStatus, OrderStatus } from "./lib/types";
import { groupBy, calculateTotalRevenue } from "./lib/helpers";
import { resolveStorageUrl } from "./files";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) return [];

    if (!isAdmin(currentUser.role)) {
      return await ctx.db
        .query("restaurants")
        .withIndex("by_owner_and_deletedAt", (q) =>
          q.eq("ownerId", currentUser._id).eq("deletedAt", undefined)
        )
        .collect();
    }

    return await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", RestaurantStatus.ACTIVE))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    logoId: v.optional(v.id("_storage")),
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
      logoId: args.logoId,
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
      logoId: v.optional(v.id("_storage")),
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

    // If replacing logo, delete old one from storage
    if (args.options.logoId && restaurant.logoId && restaurant.logoId !== args.options.logoId) {
      await ctx.storage.delete(restaurant.logoId);
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

    const logoUrl = await resolveStorageUrl(ctx, restaurant.logoId) ?? restaurant.logoUrl ?? null;

    return {
      _id: restaurant._id,
      _creationTime: restaurant._creationTime,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      status: restaurant.status,
      isActive: restaurant.isActive,
      logoUrl,
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
      .withIndex("by_owner_and_deletedAt", (q) =>
        q.eq("ownerId", currentUser._id).eq("deletedAt", undefined)
      )
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

    const restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", RestaurantStatus.ACTIVE))
      .collect();

    const completedOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", OrderStatus.COMPLETED))
      .collect();

    const revenueByRestaurant = groupBy(completedOrders, (order) =>
      order.restaurantId.toString()
    );

    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const restaurantOrders = revenueByRestaurant.get(restaurant._id.toString()) ?? [];
        const totalRevenue = calculateTotalRevenue(restaurantOrders);
        const logoUrl = await resolveStorageUrl(ctx, restaurant.logoId) ?? restaurant.logoUrl ?? null;

        return {
          ...restaurant,
          logoUrl,
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

    const completedOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurantId_and_status", (q) =>
        q.eq("restaurantId", restaurant._id).eq("status", OrderStatus.COMPLETED)
      )
      .collect();

    const pendingOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurantId_and_status", (q) =>
        q.eq("restaurantId", restaurant._id).eq("status", OrderStatus.PENDING)
      )
      .collect();

    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const totalRevenue = calculateTotalRevenue(completedOrders);

    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const logoUrl = await resolveStorageUrl(ctx, restaurant.logoId) ?? restaurant.logoUrl ?? null;

    return {
      ...restaurant,
      logoUrl,
      stats: {
        totalRevenue,
        totalOrders: allOrders.length,
        pendingOrders: pendingOrders.length,
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

    const activeRestaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", RestaurantStatus.ACTIVE))
      .collect();

    const inactiveRestaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", RestaurantStatus.INACTIVE))
      .collect();

    const maintenanceRestaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) => q.eq("status", RestaurantStatus.MAINTENANCE))
      .collect();

    const totalRestaurants =
      activeRestaurants.length + inactiveRestaurants.length + maintenanceRestaurants.length;

    const now = Date.now();
    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires_at", (q) => q.gt("expiresAt", now))
      .collect();

    const allCompletedOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", OrderStatus.COMPLETED))
      .collect();
    const totalRevenue = calculateTotalRevenue(allCompletedOrders);

    return {
      totalRestaurants,
      activeRestaurants: activeRestaurants.length,
      activeSessions: activeSessions.length,
      totalRevenue,
    };
  },
});

export const searchRestaurants = query({
  args: {
    searchQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) {
      return [];
    }

    return await ctx.db
      .query("restaurants")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", args.searchQuery).eq("status", RestaurantStatus.ACTIVE)
      )
      .take(20);
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
