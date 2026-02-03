import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser, isAdmin } from "./lib/auth";
import { RestaurantStatus } from "./lib/types";

export const listFoodCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("foodCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Sort by order
    categories.sort((a, b) => a.order - b.order);

    return Promise.all(
      categories.map(async (cat) => {
        const imageUrl = cat.imageId
          ? await ctx.storage.getUrl(cat.imageId)
          : cat.imageUrl ?? null;
        return { ...cat, imageUrl };
      })
    );
  },
});

export const getFoodCategoryWithProducts = query({
  args: { foodCategoryId: v.id("foodCategories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.foodCategoryId);
    if (!category || !category.isActive) return null;

    const imageUrl = category.imageId
      ? await ctx.storage.getUrl(category.imageId)
      : category.imageUrl ?? null;

    // Get linked restaurants
    const links = await ctx.db
      .query("restaurantFoodCategories")
      .withIndex("by_category", (q) =>
        q.eq("foodCategoryId", args.foodCategoryId)
      )
      .collect();

    const restaurants = await Promise.all(
      links.map(async (link) => {
        const restaurant = await ctx.db.get(link.restaurantId);
        if (
          !restaurant ||
          restaurant.deletedAt ||
          restaurant.status !== RestaurantStatus.ACTIVE
        ) {
          return null;
        }

        const logoUrl = restaurant.logoId
          ? await ctx.storage.getUrl(restaurant.logoId)
          : restaurant.logoUrl ?? null;

        return {
          _id: restaurant._id,
          name: restaurant.name,
          logoUrl,
          deliveryFee: restaurant.deliveryFee ?? 0,
          deliveryTimeMinutes: restaurant.deliveryTimeMinutes ?? 30,
          rating: restaurant.rating ?? 0,
        };
      })
    );

    return {
      ...category,
      imageUrl,
      restaurants: restaurants.filter(Boolean),
    };
  },
});

export const createFoodCategory = mutation({
  args: {
    name: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can create food categories");
    }

    return ctx.db.insert("foodCategories", {
      name: args.name,
      imageId: args.imageId,
      imageUrl: args.imageUrl,
      order: args.order,
      isActive: true,
    });
  },
});

export const updateFoodCategory = mutation({
  args: {
    id: v.id("foodCategories"),
    name: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can update food categories");
    }

    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(id, filtered);
    return true;
  },
});

export const deleteFoodCategory = mutation({
  args: { id: v.id("foodCategories") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can delete food categories");
    }

    // Remove all restaurant links
    const links = await ctx.db
      .query("restaurantFoodCategories")
      .withIndex("by_category", (q) => q.eq("foodCategoryId", args.id))
      .collect();

    await Promise.all(links.map((link) => ctx.db.delete(link._id)));
    await ctx.db.delete(args.id);

    return true;
  },
});

export const linkRestaurantToCategory = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    foodCategoryId: v.id("foodCategories"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can link restaurants to categories");
    }

    // Check if link already exists
    const existing = await ctx.db
      .query("restaurantFoodCategories")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const alreadyLinked = existing.some(
      (link) => link.foodCategoryId === args.foodCategoryId
    );

    if (alreadyLinked) return;

    await ctx.db.insert("restaurantFoodCategories", {
      restaurantId: args.restaurantId,
      foodCategoryId: args.foodCategoryId,
    });
  },
});

export const unlinkRestaurantFromCategory = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    foodCategoryId: v.id("foodCategories"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can unlink restaurants from categories");
    }

    const links = await ctx.db
      .query("restaurantFoodCategories")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const link = links.find(
      (l) => l.foodCategoryId === args.foodCategoryId
    );

    if (link) {
      await ctx.db.delete(link._id);
    }
  },
});
