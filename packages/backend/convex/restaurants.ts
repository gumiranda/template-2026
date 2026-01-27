import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser, isAdmin, isRestaurantStaff } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isRestaurantStaff(user.role)) return [];
    return await ctx.db.query("restaurants").collect();
  },
});

export const get = query({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdentifier = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.restaurantId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Not authorized");
    }
    return await ctx.db.insert("restaurants", {
      ...args,
      ownerId: user._id,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("restaurants"),
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Not authorized");
    }
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const deleteRestaurant = mutation({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Not authorized");
    }
    await ctx.db.delete(args.id);
  },
});
