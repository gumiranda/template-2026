import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdminRestaurantAccess } from "./lib/auth";
import { groupBy } from "./lib/helpers";
import { resolveStorageUrl } from "./files";

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

    // Resolve image URLs for all items
    const itemsWithUrls = await Promise.all(
      allItems.map(async (item) => {
        const imageUrl = await resolveStorageUrl(ctx, item.imageId) ?? item.imageUrl ?? null;
        return { ...item, imageUrl };
      })
    );

    const itemsByCategory = groupBy(itemsWithUrls, (item) => item.categoryId.toString());

    return categories.map((category) => ({
      ...category,
      items: itemsByCategory.get(category._id.toString()) ?? [],
    }));
  },
});

export const searchMenuItems = query({
  args: {
    restaurantId: v.id("restaurants"),
    searchQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", args.searchQuery).eq("restaurantId", args.restaurantId).eq("isActive", true)
      )
      .take(20);

    return await Promise.all(
      items.map(async (item) => {
        const imageUrl = await resolveStorageUrl(ctx, item.imageId) ?? item.imageUrl ?? null;
        return { ...item, imageUrl };
      })
    );
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
    imageId: v.optional(v.id("_storage")),
    discountPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdminRestaurantAccess(ctx, args.restaurantId);

    if (args.price <= 0) {
      throw new Error("Price must be greater than zero");
    }

    if (
      args.discountPercentage !== undefined &&
      (args.discountPercentage < 0 || args.discountPercentage > 100)
    ) {
      throw new Error("Discount percentage must be between 0 and 100");
    }

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
      imageId: args.imageId,
      discountPercentage: args.discountPercentage,
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
    imageId: v.optional(v.id("_storage")),
    categoryId: v.optional(v.id("menuCategories")),
    discountPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    await requireAdminRestaurantAccess(ctx, item.restaurantId);

    if (args.price !== undefined && args.price <= 0) {
      throw new Error("Price must be greater than zero");
    }

    if (
      args.discountPercentage !== undefined &&
      (args.discountPercentage < 0 || args.discountPercentage > 100)
    ) {
      throw new Error("Discount percentage must be between 0 and 100");
    }

    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.restaurantId !== item.restaurantId) {
        throw new Error("Invalid category: Category does not belong to this restaurant");
      }
    }

    // If replacing image, delete old one from storage
    if (args.imageId && item.imageId && item.imageId !== args.imageId) {
      await ctx.storage.delete(item.imageId);
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

    // Delete associated image from storage
    if (item.imageId) {
      await ctx.storage.delete(item.imageId);
    }

    return await ctx.db.delete(args.itemId);
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("menuCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    await requireAdminRestaurantAccess(ctx, category.restaurantId);

    const { categoryId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    return await ctx.db.patch(categoryId, filteredUpdates);
  },
});

export const deleteCategory = mutation({
  args: {
    categoryId: v.id("menuCategories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    await requireAdminRestaurantAccess(ctx, category.restaurantId);

    // Delete all items in this category and their images
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const item of items) {
      if (item.imageId) {
        await ctx.storage.delete(item.imageId);
      }
      await ctx.db.delete(item._id);
    }

    return await ctx.db.delete(args.categoryId);
  },
});

export const reorderCategories = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    orderedIds: v.array(
      v.object({
        id: v.id("menuCategories"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdminRestaurantAccess(ctx, args.restaurantId);

    for (const { id, order } of args.orderedIds) {
      const category = await ctx.db.get(id);
      if (!category || category.restaurantId !== args.restaurantId) {
        throw new Error("Category does not belong to this restaurant");
      }
      await ctx.db.patch(id, { order });
    }
  },
});
