import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthenticatedUser, canModifyRestaurant, isAdmin } from "./lib/auth";
import { RestaurantStatus, OrderStatus } from "./lib/types";
import { calculateTotalRevenue } from "./lib/helpers";
import { MAX_DESCRIPTION_LENGTH } from "./lib/constants";
import { resolveImageUrl, resolveStorageUrl } from "./files";

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

    const name = args.name.trim();
    if (!name || name.length > 200) {
      throw new Error("Restaurant name must be between 1 and 200 characters");
    }

    const address = args.address.trim();
    if (!address || address.length > 500) {
      throw new Error("Address must be between 1 and 500 characters");
    }

    if (args.description && args.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    if (args.phone !== undefined) {
      const phone = args.phone.trim();
      if (phone.length > 30) {
        throw new Error("Phone number must be 30 characters or less");
      }
    }

    return ctx.db.insert("restaurants", {
      name,
      address,
      phone: args.phone?.trim(),
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

    const name = args.options.name.trim();
    if (!name || name.length > 200) {
      throw new Error("Restaurant name must be between 1 and 200 characters");
    }

    const address = args.options.address.trim();
    if (!address || address.length > 500) {
      throw new Error("Address must be between 1 and 500 characters");
    }

    if (args.options.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    const phone = args.options.phone.trim();
    if (phone.length > 30) {
      throw new Error("Phone number must be 30 characters or less");
    }

    // If replacing logo, delete old one from storage
    if (args.options.logoId && restaurant.logoId && restaurant.logoId !== args.options.logoId) {
      await ctx.storage.delete(restaurant.logoId);
    }

    return await ctx.db.patch(args.id, {
      ...args.options,
      name,
      address,
      phone,
    });
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

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: currentUser._id,
      status: RestaurantStatus.INACTIVE,
    });

    // Cascade: deactivate tables
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.id))
      .collect();
    for (const table of tables) {
      if (table.isActive) {
        await ctx.db.patch(table._id, { isActive: false });
      }
    }

    // Cascade: expire active sessions
    const now = Date.now();
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.id))
      .collect();
    for (const session of sessions) {
      if (session.expiresAt > now) {
        await ctx.db.patch(session._id, { expiresAt: now });
      }
    }

    // Cascade: deactivate active carts
    const activeCarts = await ctx.db
      .query("carts")
      .withIndex("by_restaurantId_and_isActive", (q) =>
        q.eq("restaurantId", args.id).eq("isActive", true)
      )
      .collect();
    for (const cart of activeCarts) {
      await ctx.db.patch(cart._id, { isActive: false });
    }
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

    const logoUrl = await resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl);

    return {
      _id: restaurant._id,
      _creationTime: restaurant._creationTime,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      status: restaurant.status,
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

    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const completedOrders = await ctx.db
          .query("orders")
          .withIndex("by_restaurantId_and_status", (q) =>
            q.eq("restaurantId", restaurant._id).eq("status", OrderStatus.COMPLETED)
          )
          .collect();
        const totalRevenue = calculateTotalRevenue(completedOrders);
        const logoUrl = await resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl);
        const coverImageUrl = await resolveStorageUrl(ctx, restaurant.coverImageId);
        const tables = await ctx.db
          .query("tables")
          .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
          .collect();

        return {
          ...restaurant,
          logoUrl,
          coverImageUrl,
          totalRevenue,
          tablesCount: tables.length,
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

    const [completedOrders, pendingOrders, tables, menuItems, logoUrl, coverImageUrl] =
      await Promise.all([
        ctx.db
          .query("orders")
          .withIndex("by_restaurantId_and_status", (q) =>
            q.eq("restaurantId", restaurant._id).eq("status", OrderStatus.COMPLETED)
          )
          .collect(),
        ctx.db
          .query("orders")
          .withIndex("by_restaurantId_and_status", (q) =>
            q.eq("restaurantId", restaurant._id).eq("status", OrderStatus.PENDING)
          )
          .collect(),
        ctx.db
          .query("tables")
          .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
          .collect(),
        ctx.db
          .query("menuItems")
          .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
          .collect(),
        resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl),
        resolveStorageUrl(ctx, restaurant.coverImageId),
      ]);

    const totalRevenue = calculateTotalRevenue(completedOrders);

    return {
      ...restaurant,
      logoUrl,
      coverImageUrl,
      stats: {
        totalRevenue,
        totalOrders: completedOrders.length + pendingOrders.length,
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

    const allRestaurants = await ctx.db.query("restaurants").collect();
    const activeCount = allRestaurants.filter(
      (r) => (r.status ?? RestaurantStatus.ACTIVE) === RestaurantStatus.ACTIVE && !r.deletedAt
    ).length;
    const totalRestaurants = allRestaurants.length;

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

    const allTables = await ctx.db.query("tables").collect();

    return {
      totalRestaurants,
      activeRestaurants: activeCount,
      activeSessions: activeSessions.length,
      totalRevenue,
      totalTables: allTables.length,
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
