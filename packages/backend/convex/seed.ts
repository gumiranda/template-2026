import { internalMutation } from "./_generated/server";

export const seedFoodCategories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("foodCategories").first();
    if (existing) {
      console.log("Food categories already seeded, skipping.");
      return;
    }

    const categories = [
      { name: "Hambúrgueres", order: 1, imageUrl: "https://img.icons8.com/emoji/96/hamburger-emoji.png" },
      { name: "Pizzas", order: 2, imageUrl: "https://img.icons8.com/emoji/96/pizza-emoji.png" },
      { name: "Japonesa", order: 3, imageUrl: "https://img.icons8.com/emoji/96/sushi-emoji.png" },
      { name: "Brasileira", order: 4, imageUrl: "https://img.icons8.com/emoji/96/pot-of-food-emoji.png" },
      { name: "Sobremesas", order: 5, imageUrl: "https://img.icons8.com/emoji/96/ice-cream-emoji.png" },
      { name: "Sucos", order: 6, imageUrl: "https://img.icons8.com/emoji/96/tropical-drink-emoji.png" },
    ];

    for (const cat of categories) {
      await ctx.db.insert("foodCategories", {
        name: cat.name,
        order: cat.order,
        imageUrl: cat.imageUrl,
        isActive: true,
      });
    }

    console.log(`Seeded ${categories.length} food categories.`);
  },
});

export const seedPromoBanners = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("promoBanners").first();
    if (existing) {
      console.log("Promo banners already seeded, skipping.");
      return;
    }

    const banners = [
      {
        title: "Desconto de 20% em Hambúrgueres",
        imageUrl: "https://placehold.co/800x300/FF6B35/white?text=20%25+OFF+Burgers",
        linkUrl: "/categories",
        order: 1,
      },
      {
        title: "Frete Grátis acima de R$50",
        imageUrl: "https://placehold.co/800x300/4ECDC4/white?text=Frete+Gr%C3%A1tis",
        linkUrl: "/restaurants",
        order: 2,
      },
    ];

    for (const banner of banners) {
      await ctx.db.insert("promoBanners", {
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        order: banner.order,
        isActive: true,
      });
    }

    console.log(`Seeded ${banners.length} promo banners.`);
  },
});

export const runFullSeed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Seed food categories
    const existingCategories = await ctx.db.query("foodCategories").first();
    if (!existingCategories) {
      const categories = [
        { name: "Hambúrgueres", order: 1, imageUrl: "https://img.icons8.com/emoji/96/hamburger-emoji.png" },
        { name: "Pizzas", order: 2, imageUrl: "https://img.icons8.com/emoji/96/pizza-emoji.png" },
        { name: "Japonesa", order: 3, imageUrl: "https://img.icons8.com/emoji/96/sushi-emoji.png" },
        { name: "Brasileira", order: 4, imageUrl: "https://img.icons8.com/emoji/96/pot-of-food-emoji.png" },
        { name: "Sobremesas", order: 5, imageUrl: "https://img.icons8.com/emoji/96/ice-cream-emoji.png" },
        { name: "Sucos", order: 6, imageUrl: "https://img.icons8.com/emoji/96/tropical-drink-emoji.png" },
      ];

      for (const cat of categories) {
        await ctx.db.insert("foodCategories", {
          name: cat.name,
          order: cat.order,
          imageUrl: cat.imageUrl,
          isActive: true,
        });
      }
      console.log(`Seeded ${categories.length} food categories.`);
    }

    // Seed promo banners
    const existingBanners = await ctx.db.query("promoBanners").first();
    if (!existingBanners) {
      const banners = [
        {
          title: "Desconto de 20% em Hambúrgueres",
          imageUrl: "https://placehold.co/800x300/FF6B35/white?text=20%25+OFF+Burgers",
          linkUrl: "/categories",
          order: 1,
        },
        {
          title: "Frete Grátis acima de R$50",
          imageUrl: "https://placehold.co/800x300/4ECDC4/white?text=Frete+Gr%C3%A1tis",
          linkUrl: "/restaurants",
          order: 2,
        },
      ];

      for (const banner of banners) {
        await ctx.db.insert("promoBanners", {
          title: banner.title,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          order: banner.order,
          isActive: true,
        });
      }
      console.log(`Seeded ${banners.length} promo banners.`);
    }

    console.log("Full seed complete.");
  },
});
