import { internalMutation } from "./_generated/server";
import { OrderType } from "./lib/types";

export const addDeliveryFieldsToRestaurants = internalMutation({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db.query("restaurants").collect();
    let count = 0;

    for (const restaurant of restaurants) {
      if (restaurant.deliveryFee === undefined) {
        await ctx.db.patch(restaurant._id, {
          deliveryFee: 0,
          deliveryTimeMinutes: 30,
        });
        count++;
      }
    }

    return { migratedCount: count };
  },
});

export const addDiscountToMenuItems = internalMutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    let count = 0;

    for (const item of items) {
      if (item.discountPercentage === undefined) {
        await ctx.db.patch(item._id, {
          discountPercentage: 0,
        });
        count++;
      }
    }

    return { migratedCount: count };
  },
});

export const setDefaultOrderType = internalMutation({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    let count = 0;

    for (const order of orders) {
      if (order.orderType === undefined) {
        await ctx.db.patch(order._id, {
          orderType: OrderType.DINE_IN,
        });
        count++;
      }
    }

    return { migratedCount: count };
  },
});
