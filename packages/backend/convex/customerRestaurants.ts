import { v } from "convex/values";
import { query } from "./_generated/server";
import { RestaurantStatus } from "./lib/types";

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
        const logoUrl = r.logoId
          ? await ctx.storage.getUrl(r.logoId)
          : r.logoUrl ?? null;
        const coverImageUrl = r.coverImageId
          ? await ctx.storage.getUrl(r.coverImageId)
          : null;

        return {
          _id: r._id,
          name: r.name,
          address: r.address,
          phone: r.phone,
          description: r.description,
          logoUrl,
          coverImageUrl,
          deliveryFee: r.deliveryFee ?? 0,
          deliveryTimeMinutes: r.deliveryTimeMinutes ?? 30,
          rating: r.rating ?? 0,
        };
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
      activeResults.map(async (r) => {
        const logoUrl = r.logoId
          ? await ctx.storage.getUrl(r.logoId)
          : r.logoUrl ?? null;
        const coverImageUrl = r.coverImageId
          ? await ctx.storage.getUrl(r.coverImageId)
          : null;

        return {
          _id: r._id,
          name: r.name,
          address: r.address,
          description: r.description,
          logoUrl,
          coverImageUrl,
          deliveryFee: r.deliveryFee ?? 0,
          deliveryTimeMinutes: r.deliveryTimeMinutes ?? 30,
          rating: r.rating ?? 0,
        };
      })
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

    const logoUrl = restaurant.logoId
      ? await ctx.storage.getUrl(restaurant.logoId)
      : restaurant.logoUrl ?? null;
    const coverImageUrl = restaurant.coverImageId
      ? await ctx.storage.getUrl(restaurant.coverImageId)
      : null;

    // Fetch menu categories with items
    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const activeCategories = categories.filter((c) => c.isActive);

    const categoriesWithItems = await Promise.all(
      activeCategories.map(async (category) => {
        const items = await ctx.db
          .query("menuItems")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();

        const activeItems = items.filter((item) => item.isActive);

        const itemsWithImages = await Promise.all(
          activeItems.map(async (item) => {
            const imageUrl = item.imageId
              ? await ctx.storage.getUrl(item.imageId)
              : item.imageUrl ?? null;
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

        const logoUrl = restaurant.logoId
          ? await ctx.storage.getUrl(restaurant.logoId)
          : restaurant.logoUrl ?? null;
        const coverImageUrl = restaurant.coverImageId
          ? await ctx.storage.getUrl(restaurant.coverImageId)
          : null;

        return {
          _id: restaurant._id,
          name: restaurant.name,
          address: restaurant.address,
          description: restaurant.description,
          logoUrl,
          coverImageUrl,
          deliveryFee: restaurant.deliveryFee ?? 0,
          deliveryTimeMinutes: restaurant.deliveryTimeMinutes ?? 30,
          rating: restaurant.rating ?? 0,
        };
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
      top.map(async (r) => {
        const logoUrl = r.logoId
          ? await ctx.storage.getUrl(r.logoId)
          : r.logoUrl ?? null;
        const coverImageUrl = r.coverImageId
          ? await ctx.storage.getUrl(r.coverImageId)
          : null;

        return {
          _id: r._id,
          name: r.name,
          address: r.address,
          description: r.description,
          logoUrl,
          coverImageUrl,
          deliveryFee: r.deliveryFee ?? 0,
          deliveryTimeMinutes: r.deliveryTimeMinutes ?? 30,
          rating: r.rating ?? 0,
        };
      })
    );
  },
});
