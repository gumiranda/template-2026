import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { RestaurantStatus } from "./lib/types";

export const syncClerkUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, { name: args.name });
      return existingUser._id;
    }

    return null;
  },
});

export const handleClerkUserDeleted = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return;

    // Cascade: remove favorites
    const favorites = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const fav of favorites) {
      await ctx.db.delete(fav._id);
    }

    // Cascade: remove stripe data
    const stripeData = await ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (stripeData) {
      await ctx.db.delete(stripeData._id);
    }

    // Cascade: remove restaurant staff links
    const staffLinks = await ctx.db
      .query("restaurantStaff")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const link of staffLinks) {
      await ctx.db.delete(link._id);
    }

    // Cascade: soft-delete owned restaurants
    const ownedRestaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
    for (const restaurant of ownedRestaurants) {
      if (!restaurant.deletedAt) {
        await ctx.db.patch(restaurant._id, {
          deletedAt: Date.now(),
          deletedBy: user._id,
          status: RestaurantStatus.INACTIVE,
        });
      }
    }

    // Cascade: nullify userId on user's orders (preserve order data for restaurant records)
    const userOrders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const order of userOrders) {
      await ctx.db.patch(order._id, { userId: undefined });
    }

    await ctx.db.delete(user._id);
  },
});
