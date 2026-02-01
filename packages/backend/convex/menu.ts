import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdminRestaurantAccess } from "./lib/auth";
import { groupBy } from "./lib/helpers";

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

    const itemsByCategory = groupBy(allItems, (item) => item.categoryId.toString());

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
    await requireAdminRestaurantAccess(ctx, args.restaurantId);

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
    await requireAdminRestaurantAccess(ctx, args.restaurantId);

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
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    await requireAdminRestaurantAccess(ctx, item.restaurantId);

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
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    await requireAdminRestaurantAccess(ctx, item.restaurantId);

    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.restaurantId !== item.restaurantId) {
        throw new Error("Invalid category: Category does not belong to this restaurant");
      }
    }

    const { itemId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    return await ctx.db.patch(itemId, filteredUpdates);
  },
});

export const deleteItem = mutation({
  args: {
    itemId: v.id("menuItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    await requireAdminRestaurantAccess(ctx, item.restaurantId);

    return await ctx.db.delete(args.itemId);
  },
});
