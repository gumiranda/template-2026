import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMenuByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const categoriesWithItems = await Promise.all(
      categories.map(async (category) => {
        const items = await ctx.db
          .query("menuItems")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();
        return { ...category, items };
      })
    );

    return categoriesWithItems;
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      restaurantId: args.restaurantId,
      categoryId: args.categoryId,
      name: args.name,
      description: args.description,
      price: args.price,
      isActive: true,
    });
  },
});
