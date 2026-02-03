import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser, isAdmin } from "./lib/auth";

export const listActiveBanners = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db
      .query("promoBanners")
      .withIndex("by_active_and_order", (q) => q.eq("isActive", true))
      .collect();

    return Promise.all(
      banners.map(async (banner) => {
        const imageUrl = banner.imageId
          ? await ctx.storage.getUrl(banner.imageId)
          : banner.imageUrl ?? null;
        return { ...banner, imageUrl };
      })
    );
  },
});

export const createBanner = mutation({
  args: {
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can create banners");
    }

    return ctx.db.insert("promoBanners", {
      title: args.title,
      imageId: args.imageId,
      imageUrl: args.imageUrl,
      linkUrl: args.linkUrl,
      order: args.order,
      isActive: true,
    });
  },
});

export const updateBanner = mutation({
  args: {
    id: v.id("promoBanners"),
    title: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can update banners");
    }

    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(id, filtered);
    return true;
  },
});

export const deleteBanner = mutation({
  args: { id: v.id("promoBanners") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can delete banners");
    }

    const banner = await ctx.db.get(args.id);
    if (banner?.imageId) {
      await ctx.storage.delete(banner.imageId);
    }

    await ctx.db.delete(args.id);
    return true;
  },
});
