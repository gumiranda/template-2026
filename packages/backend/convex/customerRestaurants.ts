import { v } from "convex/values";
import { query } from "./_generated/server";
import { RestaurantStatus } from "./lib/types";
import { resolveImageUrl, resolveStorageUrl } from "./files";
import { toPublicRestaurant } from "./lib/helpers";

export const listPublicRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) =>
        q.eq("status", RestaurantStatus.ACTIVE)
      )
      .collect();

    const activeRestaurants = restaurants.filter((r) => !r.deletedAt);

    return Promise.all(
      activeRestaurants.map(async (r) => {
        const base = await toPublicRestaurant(ctx, r);
        return { ...base, phone: r.phone };
      })
    );
  },
});

export const searchPublicRestaurants = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchQuery.trim()) return [];

    const results = await ctx.db
      .query("restaurants")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", args.searchQuery).eq("status", RestaurantStatus.ACTIVE)
      )
      .take(20);

    const activeResults = results.filter((r) => !r.deletedAt);

    return Promise.all(
      activeResults.map((r) => toPublicRestaurant(ctx, r))
    );
  },
});

export const getPublicRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant || restaurant.deletedAt || restaurant.status !== RestaurantStatus.ACTIVE) {
      return null;
    }

    const logoUrl = await resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl);
    const coverImageUrl = await resolveStorageUrl(ctx, restaurant.coverImageId);

    // Fetch menu categories with items
    const activeCategories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurantId_and_isActive", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("isActive", true)
      )
      .collect();

    const categoriesWithItems = await Promise.all(
      activeCategories.map(async (category) => {
        const activeItems = await ctx.db
          .query("menuItems")
          .withIndex("by_categoryId_and_isActive", (q) =>
            q.eq("categoryId", category._id).eq("isActive", true)
          )
          .collect();

        const itemsWithImages = await Promise.all(
          activeItems.map(async (item) => {
            const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);
            return { ...item, imageUrl };
          })
        );

        return {
          ...category,
          items: itemsWithImages,
        };
      })
    );

    return {
      _id: restaurant._id,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      logoUrl,
      coverImageUrl,
      deliveryFee: restaurant.deliveryFee ?? 0,
      deliveryTimeMinutes: restaurant.deliveryTimeMinutes ?? 30,
      rating: restaurant.rating ?? 0,
      categories: categoriesWithItems,
    };
  },
});

export const getRestaurantsByFoodCategory = query({
  args: { foodCategoryId: v.id("foodCategories") },
  handler: async (ctx, args) => {
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

        return toPublicRestaurant(ctx, restaurant);
      })
    );

    return restaurants.filter(
      (r): r is NonNullable<typeof r> => r !== null
    );
  },
});

export const getRecommendedRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) =>
        q.eq("status", RestaurantStatus.ACTIVE)
      )
      .collect();

    const activeRestaurants = restaurants.filter((r) => !r.deletedAt);

    // Sort by rating descending
    activeRestaurants.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    const top = activeRestaurants.slice(0, 10);

    return Promise.all(
      top.map((r) => toPublicRestaurant(ctx, r))
    );
  },
});
