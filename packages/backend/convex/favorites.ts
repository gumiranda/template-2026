import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";
import { RestaurantStatus } from "./lib/types";

export const toggleFavorite = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const existing = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user_and_restaurant", (q) =>
        q.eq("userId", user._id).eq("restaurantId", args.restaurantId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }

    await ctx.db.insert("favoriteRestaurants", {
      userId: user._id,
      restaurantId: args.restaurantId,
    });

    return { favorited: true };
  },
});

export const getUserFavorites = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const favorites = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return favorites.map((f) => f.restaurantId);
  },
});

export const getUserFavoriteRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const favorites = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const restaurants = await Promise.all(
      favorites.map(async (fav) => {
        const restaurant = await ctx.db.get(fav.restaurantId);
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
