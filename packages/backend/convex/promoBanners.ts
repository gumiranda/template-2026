import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser, isAdmin } from "./lib/auth";
import { filterUndefined } from "./lib/helpers";
import { resolveImageUrl } from "./files";

function validateLinkUrl(url: string) {
  if (url.startsWith("/")) return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Invalid protocol");
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Invalid protocol") throw e;
    throw new Error("linkUrl must be a relative path or a valid HTTP/HTTPS URL");
  }
}

export const listAllBanners = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || !isAdmin(user.role)) {
      throw new Error("Only admins can list all banners");
    }

    const banners = await ctx.db.query("promoBanners").collect();
    banners.sort((a, b) => a.order - b.order);

    return Promise.all(
      banners.map(async (banner) => {
        const imageUrl = await resolveImageUrl(ctx, banner.imageId, banner.imageUrl);
        return { ...banner, imageUrl };
      })
    );
  },
});

export const listActiveBanners = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db
      .query("promoBanners")
      .withIndex("by_active_and_order", (q) => q.eq("isActive", true))
      .collect();

    return Promise.all(
      banners.map(async (banner) => {
        const imageUrl = await resolveImageUrl(ctx, banner.imageId, banner.imageUrl);
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

    const title = args.title.trim();
    if (!title || title.length > 200) {
      throw new Error("Title must be between 1 and 200 characters");
    }

    if (args.linkUrl) validateLinkUrl(args.linkUrl);

    return ctx.db.insert("promoBanners", {
      title,
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

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title || title.length > 200) {
        throw new Error("Title must be between 1 and 200 characters");
      }
      args = { ...args, title };
    }

    if (args.linkUrl) validateLinkUrl(args.linkUrl);

    const { id, ...updates } = args;
    await ctx.db.patch(id, filterUndefined(updates));
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
