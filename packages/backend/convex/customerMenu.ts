import { v } from "convex/values";
import { query } from "./_generated/server";
import { RestaurantStatus } from "./lib/types";
import { calculateDiscountedPrice } from "./lib/helpers";
import { resolveImageUrl } from "./files";

export const getPublicMenuByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant || restaurant.deletedAt || restaurant.status !== RestaurantStatus.ACTIVE) {
      return [];
    }

    const activeCategories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurantId_and_isActive", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("isActive", true)
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

        const itemsWithPrices = await Promise.all(
          activeItems.map(async (item) => {
            const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);

            const discountPercentage = item.discountPercentage ?? 0;
            const discountedPrice = calculateDiscountedPrice(item.price, discountPercentage);

            return {
              _id: item._id,
              name: item.name,
              description: item.description,
              price: item.price,
              discountPercentage,
              discountedPrice,
              imageUrl,
              restaurantId: item.restaurantId,
            };
          })
        );

        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          order: category.order,
          items: itemsWithPrices,
        };
      })
    );
  },
});

export const getProductDetails = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.menuItemId);
    if (!item || !item.isActive) return null;

    const restaurant = await ctx.db.get(item.restaurantId);
    if (!restaurant || restaurant.deletedAt || restaurant.status !== RestaurantStatus.ACTIVE) {
      return null;
    }

    const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);
    const logoUrl = await resolveImageUrl(ctx, restaurant.logoId, restaurant.logoUrl);

    const discountPercentage = item.discountPercentage ?? 0;
    const discountedPrice = calculateDiscountedPrice(item.price, discountPercentage);

    // Fetch related products from the same category
    const relatedItems = await ctx.db
      .query("menuItems")
      .withIndex("by_categoryId_and_isActive", (q) =>
        q.eq("categoryId", item.categoryId).eq("isActive", true)
      )
      .collect();

    const relatedProducts = await Promise.all(
      relatedItems
        .filter((ri) => ri._id !== args.menuItemId)
        .slice(0, 6)
        .map(async (ri) => {
          const riImageUrl = await resolveImageUrl(ctx, ri.imageId, ri.imageUrl);
          const riDiscount = ri.discountPercentage ?? 0;
          return {
            _id: ri._id,
            name: ri.name,
            price: ri.price,
            discountPercentage: riDiscount,
            discountedPrice: calculateDiscountedPrice(ri.price, riDiscount),
            imageUrl: riImageUrl,
            restaurantId: ri.restaurantId,
          };
        })
    );

    return {
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      discountPercentage,
      discountedPrice,
      imageUrl,
      restaurantId: item.restaurantId,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        logoUrl,
        deliveryFee: restaurant.deliveryFee ?? 0,
        deliveryTimeMinutes: restaurant.deliveryTimeMinutes ?? 30,
      },
      relatedProducts,
    };
  },
});

export const getRecommendedProducts = query({
  args: {},
  handler: async (ctx) => {
    // Get active items with discounts, limited to avoid exceeding Convex read limits
    const candidateItems = await ctx.db
      .query("menuItems")
      .withIndex("by_discount")
      .order("desc")
      .take(200);

    const discountedItems = candidateItems.filter(
      (item) =>
        item.isActive &&
        item.discountPercentage !== undefined &&
        item.discountPercentage > 0
    );

    const top = discountedItems.slice(0, 20);

    return Promise.all(
      top.map(async (item) => {
        const restaurant = await ctx.db.get(item.restaurantId);
        if (
          !restaurant ||
          restaurant.deletedAt ||
          restaurant.status !== RestaurantStatus.ACTIVE
        ) {
          return null;
        }

        const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);

        const discountPercentage = item.discountPercentage ?? 0;
        return {
          _id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          discountPercentage,
          discountedPrice: calculateDiscountedPrice(item.price, discountPercentage),
          imageUrl,
          restaurantId: item.restaurantId,
          restaurantName: restaurant.name,
        };
      })
    ).then((results) =>
      results.filter((r): r is NonNullable<typeof r> => r !== null)
    );
  },
});

export const getProductsByFoodCategory = query({
  args: { foodCategoryId: v.id("foodCategories") },
  handler: async (ctx, args) => {
    // Get restaurants linked to this food category
    const links = await ctx.db
      .query("restaurantFoodCategories")
      .withIndex("by_category", (q) =>
        q.eq("foodCategoryId", args.foodCategoryId)
      )
      .collect();

    const allProducts = await Promise.all(
      links.map(async (link) => {
        const restaurant = await ctx.db.get(link.restaurantId);
        if (
          !restaurant ||
          restaurant.deletedAt ||
          restaurant.status !== RestaurantStatus.ACTIVE
        ) {
          return [];
        }

        const activeItems = await ctx.db
          .query("menuItems")
          .withIndex("by_restaurantId_and_isActive", (q) =>
            q.eq("restaurantId", link.restaurantId).eq("isActive", true)
          )
          .collect();

        return Promise.all(
          activeItems.map(async (item) => {
            const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);
            const discountPercentage = item.discountPercentage ?? 0;
            return {
              _id: item._id,
              name: item.name,
              description: item.description,
              price: item.price,
              discountPercentage,
              discountedPrice: calculateDiscountedPrice(item.price, discountPercentage),
              imageUrl,
              restaurantId: item.restaurantId,
              restaurantName: restaurant.name,
            };
          })
        );
      })
    );

    return allProducts.flat();
  },
});
