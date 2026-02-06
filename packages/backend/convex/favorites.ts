import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";
import { toPublicRestaurant, isActiveRestaurant } from "./lib/helpers";

export const toggleFavorite = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Authentication required");

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant || restaurant.deletedAt) throw new Error("Restaurant not found");

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
