import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { RestaurantStatus } from "./lib/types";
import { resolveImageUrl, resolveStorageUrl } from "./files";
import { toPublicRestaurant, isActiveRestaurant, calculateDiscountedPrice } from "./lib/helpers";

import { MAX_PUBLIC_RESTAURANTS, MAX_SEARCH_RESULTS } from "./lib/constants";

async function fetchCategoriesWithItems(ctx: QueryCtx, restaurantId: Id<"restaurants">) {
  const activeCategories = await ctx.db
    .query("menuCategories")
    .withIndex("by_restaurantId_and_isActive", (q) =>
      q.eq("restaurantId", restaurantId).eq("isActive", true)
    )
    .collect();

  return Promise.all(
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
          const discountPercentage = item.discountPercentage ?? 0;
          const discountedPrice = calculateDiscountedPrice(item.price, discountPercentage);
          return { ...item, imageUrl, discountedPrice };
        })
      );

      return { ...category, items: itemsWithImages };
    })
  );
}

function toFullPublicRestaurant(
  restaurant: Doc<"restaurants">,
  logoUrl: string | null,
  coverImageUrl: string | null,
  categories: Awaited<ReturnType<typeof fetchCategoriesWithItems>>
) {
  return {
    _id: restaurant._id,
    name: restaurant.name,
    slug: restaurant.slug,
    address: restaurant.address,
    phone: restaurant.phone,
    description: restaurant.description,
    logoUrl,
    coverImageUrl,
    deliveryFee: restaurant.deliveryFee ?? 0,
    deliveryTimeMinutes: restaurant.deliveryTimeMinutes ?? 30,
    rating: restaurant.rating ?? 0,
    categories,
  };
}

const MAX_RECOMMENDED = 10;
const MAX_SEARCH_QUERY_LENGTH = 200;

export const listPublicRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) =>
        q.eq("status", RestaurantStatus.ACTIVE)
      )
      .take(MAX_PUBLIC_RESTAURANTS);

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
    if (args.searchQuery.length > MAX_SEARCH_QUERY_LENGTH) {
      throw new Error(`Search query must be ${MAX_SEARCH_QUERY_LENGTH} characters or less`);
    }

    const results = await ctx.db
      .query("restaurants")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", args.searchQuery).eq("status", RestaurantStatus.ACTIVE)
      )
      .take(MAX_SEARCH_RESULTS);

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
    if (!isActiveRestaurant(restaurant)) {
      return null;
    }

    const [logoUrl, coverImageUrl, categories] = await Promise.all([
      resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl),
      resolveStorageUrl(ctx, restaurant.coverImageId),
      fetchCategoriesWithItems(ctx, restaurant._id),
    ]);

    return toFullPublicRestaurant(restaurant, logoUrl, coverImageUrl, categories);
  },
});

export const getRestaurantBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.toLowerCase().trim();
    if (!slug) return null;

    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!isActiveRestaurant(restaurant)) {
      return null;
    }

    const [logoUrl, coverImageUrl, categories] = await Promise.all([
      resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl),
      resolveStorageUrl(ctx, restaurant.coverImageId),
      fetchCategoriesWithItems(ctx, restaurant._id),
    ]);

    return toFullPublicRestaurant(restaurant, logoUrl, coverImageUrl, categories);
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
        if (!isActiveRestaurant(restaurant)) {
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
      .take(MAX_PUBLIC_RESTAURANTS);

    const activeRestaurants = restaurants.filter((r) => !r.deletedAt);

    // Sort by rating descending
    activeRestaurants.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    const top = activeRestaurants.slice(0, MAX_RECOMMENDED);

    return Promise.all(
      top.map((r) => toPublicRestaurant(ctx, r))
    );
  },
});
