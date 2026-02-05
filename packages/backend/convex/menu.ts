import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdminRestaurantAccess, requireRestaurantStaffAccess } from "./lib/auth";
import { groupBy, fetchModifierGroupsWithOptions, filterUndefined, validateIcon } from "./lib/helpers";
import { MAX_DESCRIPTION_LENGTH, MAX_SEARCH_RESULTS, MAX_ITEM_NAME_LENGTH, MAX_CATEGORY_NAME_LENGTH } from "./lib/constants";
import { resolveImageUrl } from "./files";

// NOTE: This query returns all items (active and inactive) for the admin panel.
// Requires staff auth to prevent exposing inactive/draft items to the public.
// For the customer-facing menu, use customerMenu.getPublicMenuByRestaurant instead.
export const getMenuByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantStaffAccess(ctx, args.restaurantId);

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
        const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);
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

// NOTE: This query is intentionally public (no auth check) to support
// customer-facing menu search. Only active items are returned.
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
      .take(MAX_SEARCH_RESULTS);

    return await Promise.all(
      items.map(async (item) => {
        const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);
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
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminRestaurantAccess(ctx, args.restaurantId);

    const name = args.name.trim();
    if (!name || name.length > MAX_CATEGORY_NAME_LENGTH) {
      throw new Error(`Category name must be between 1 and ${MAX_CATEGORY_NAME_LENGTH} characters`);
    }

    if (args.description && args.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    if (!Number.isFinite(args.order) || !Number.isInteger(args.order) || args.order < 0) {
      throw new Error("Order must be a non-negative integer");
    }

    const icon = validateIcon(args.icon);

    return await ctx.db.insert("menuCategories", {
      restaurantId: args.restaurantId,
      name,
      description: args.description,
      order: args.order,
      isActive: true,
      icon,
    });
  },
});

const MAX_TAGS = 20;
const MAX_MODIFIER_GROUPS = 20;
const MAX_MODIFIER_OPTIONS = 30;

export const createItem = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    categoryId: v.id("menuCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    discountPercentage: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdminRestaurantAccess(ctx, args.restaurantId);

    const name = args.name.trim();
    if (!name || name.length > MAX_ITEM_NAME_LENGTH) {
      throw new Error(`Item name must be between 1 and ${MAX_ITEM_NAME_LENGTH} characters`);
    }

    if (args.description && args.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    if (!Number.isFinite(args.price) || args.price <= 0) {
      throw new Error("Price must be a positive number");
    }

    if (
      args.discountPercentage !== undefined &&
      (!Number.isFinite(args.discountPercentage) || args.discountPercentage < 0 || args.discountPercentage > 100)
    ) {
      throw new Error("Discount percentage must be a number between 0 and 100");
    }

    if (args.tags && args.tags.length > MAX_TAGS) {
      throw new Error(`Maximum of ${MAX_TAGS} tags allowed`);
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.restaurantId !== args.restaurantId) {
      throw new Error("Invalid category: Category does not belong to this restaurant");
    }

    return await ctx.db.insert("menuItems", {
      restaurantId: args.restaurantId,
      categoryId: args.categoryId,
      name,
      description: args.description,
      price: args.price,
      imageId: args.imageId,
      discountPercentage: args.discountPercentage,
      isActive: true,
      tags: args.tags,
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
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    removeImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    await requireAdminRestaurantAccess(ctx, item.restaurantId);

    if (args.description !== undefined && args.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    if (args.price !== undefined && (!Number.isFinite(args.price) || args.price <= 0)) {
      throw new Error("Price must be a positive number");
    }

    if (
      args.discountPercentage !== undefined &&
      (!Number.isFinite(args.discountPercentage) || args.discountPercentage < 0 || args.discountPercentage > 100)
    ) {
      throw new Error("Discount percentage must be a number between 0 and 100");
    }

    if (args.tags && args.tags.length > MAX_TAGS) {
      throw new Error(`Maximum of ${MAX_TAGS} tags allowed`);
    }

    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.restaurantId !== item.restaurantId) {
        throw new Error("Invalid category: Category does not belong to this restaurant");
      }
    }

    // Handle image removal
    if (args.removeImage && item.imageId) {
      await ctx.storage.delete(item.imageId);
      await ctx.db.patch(args.itemId, { imageId: undefined, imageUrl: undefined });
    }

    // If replacing image, delete old one from storage
    if (args.imageId && item.imageId && item.imageId !== args.imageId) {
      await ctx.storage.delete(item.imageId);
    }

    const { itemId, removeImage, ...updates } = args;
    return await ctx.db.patch(itemId, filterUndefined(updates));
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
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    await requireAdminRestaurantAccess(ctx, category.restaurantId);

    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      if (!trimmedName || trimmedName.length > MAX_CATEGORY_NAME_LENGTH) {
        throw new Error(`Category name must be between 1 and ${MAX_CATEGORY_NAME_LENGTH} characters`);
      }
      args = { ...args, name: trimmedName };
    }

    if (args.description !== undefined && args.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    if (args.order !== undefined && (!Number.isFinite(args.order) || !Number.isInteger(args.order) || args.order < 0)) {
      throw new Error("Order must be a non-negative integer");
    }

    const validatedIcon = validateIcon(args.icon);
    args = { ...args, icon: validatedIcon };

    const { categoryId, ...updates } = args;
    return await ctx.db.patch(categoryId, filterUndefined(updates));
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

export const getItemById = query({
  args: { itemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return null;

    await requireRestaurantStaffAccess(ctx, item.restaurantId);

    const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);
    const modifierGroups = await fetchModifierGroupsWithOptions(ctx, args.itemId);

    return {
      ...item,
      imageUrl,
      modifierGroups,
    };
  },
});

export const saveModifierGroups = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    groups: v.array(
      v.object({
        name: v.string(),
        required: v.boolean(),
        order: v.number(),
        options: v.array(
          v.object({
            name: v.string(),
            price: v.number(),
            order: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.menuItemId);
    if (!item) {
      throw new Error("Menu item not found");
    }

    await requireAdminRestaurantAccess(ctx, item.restaurantId);

    if (args.groups.length > MAX_MODIFIER_GROUPS) {
      throw new Error(`Maximum of ${MAX_MODIFIER_GROUPS} modifier groups allowed`);
    }

    for (const group of args.groups) {
      const name = group.name.trim();
      if (!name || name.length > 200) {
        throw new Error("Modifier group name must be between 1 and 200 characters");
      }
      if (group.options.length > MAX_MODIFIER_OPTIONS) {
        throw new Error(
          `Maximum of ${MAX_MODIFIER_OPTIONS} options per modifier group allowed`
        );
      }
      for (const option of group.options) {
        const optName = option.name.trim();
        if (!optName || optName.length > MAX_ITEM_NAME_LENGTH) {
          throw new Error(`Option name must be between 1 and ${MAX_ITEM_NAME_LENGTH} characters`);
        }
        if (!Number.isFinite(option.price) || option.price < 0) {
          throw new Error("Option price must be a non-negative number");
        }
      }
    }

    // Delete existing groups and options (delete-and-recreate, safe in transactional mutation)
    const existingGroups = await ctx.db
      .query("modifierGroups")
      .withIndex("by_menuItem", (q) => q.eq("menuItemId", args.menuItemId))
      .collect();

    for (const group of existingGroups) {
      const options = await ctx.db
        .query("modifierOptions")
        .withIndex("by_modifierGroup", (q) =>
          q.eq("modifierGroupId", group._id)
        )
        .collect();
      for (const option of options) {
        await ctx.db.delete(option._id);
      }
      await ctx.db.delete(group._id);
    }

    // Insert new groups and options
    for (const group of args.groups) {
      const groupId = await ctx.db.insert("modifierGroups", {
        menuItemId: args.menuItemId,
        name: group.name.trim(),
        required: group.required,
        order: group.order,
      });
      for (const option of group.options) {
        await ctx.db.insert("modifierOptions", {
          modifierGroupId: groupId,
          name: option.name.trim(),
          price: option.price,
          order: option.order,
        });
      }
    }
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
