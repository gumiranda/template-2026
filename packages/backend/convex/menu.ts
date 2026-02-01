import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRestaurantAccess, isAdmin } from "./lib/auth";

export const getMenuByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const allItems = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    // Group items by categoryId using Map for O(1) lookups
    const itemsByCategory = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const key = item.categoryId.toString();
      if (!itemsByCategory.has(key)) itemsByCategory.set(key, []);
      itemsByCategory.get(key)!.push(item);
    }

    return categories.map((category) => ({
      ...category,
      items: itemsByCategory.get(category._id.toString()) ?? [],
    }));
  },
});

export const createCategory = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // Require authentication and restaurant access
    const user = await requireRestaurantAccess(ctx, args.restaurantId);

    // Verify user is admin
    if (!isAdmin(user.role)) {
      throw new Error("Access denied: Admin role required");
    }

    return await ctx.db.insert("menuCategories", {
      restaurantId: args.restaurantId,
      name: args.name,
      description: args.description,
      order: args.order,
      isActive: true,
    });
  },
});

export const createItem = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    categoryId: v.id("menuCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication and restaurant access
    const user = await requireRestaurantAccess(ctx, args.restaurantId);

    // Verify user is admin
    if (!isAdmin(user.role)) {
      throw new Error("Access denied: Admin role required");
    }

    // Verify category belongs to the same restaurant
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.restaurantId !== args.restaurantId) {
      throw new Error("Invalid category: Category does not belong to this restaurant");
    }

    return await ctx.db.insert("menuItems", {
      restaurantId: args.restaurantId,
      categoryId: args.categoryId,
      name: args.name,
      description: args.description,
      price: args.price,
      imageUrl: args.imageUrl,
      isActive: true,
    });
  },
});

export const updateItemStatus = mutation({
  args: {
    itemId: v.id("menuItems"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get the menu item to find its restaurant
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    // Require authentication and restaurant access
    const user = await requireRestaurantAccess(ctx, item.restaurantId);

    // Verify user is admin
    if (!isAdmin(user.role)) {
      throw new Error("Access denied: Admin role required");
    }

    return await ctx.db.patch(args.itemId, {
      isActive: args.isActive,
    });
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    categoryId: v.optional(v.id("menuCategories")),
  },
  handler: async (ctx, args) => {
    // Get the menu item to find its restaurant
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    // Require authentication and restaurant access
    const user = await requireRestaurantAccess(ctx, item.restaurantId);

    // Verify user is admin
    if (!isAdmin(user.role)) {
      throw new Error("Access denied: Admin role required");
    }

    // If updating categoryId, verify the new category belongs to the same restaurant
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.restaurantId !== item.restaurantId) {
        throw new Error("Invalid category: Category does not belong to this restaurant");
      }
    }

    const { itemId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    return await ctx.db.patch(itemId, filteredUpdates);
  },
});

export const deleteItem = mutation({
  args: {
    itemId: v.id("menuItems"),
  },
  handler: async (ctx, args) => {
    // Get the menu item to find its restaurant
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    // Require authentication and restaurant access
    const user = await requireRestaurantAccess(ctx, item.restaurantId);

    // Verify user is admin
    if (!isAdmin(user.role)) {
      throw new Error("Access denied: Admin role required");
    }

    return await ctx.db.delete(args.itemId);
  },
});
