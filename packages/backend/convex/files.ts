import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, isAdmin } from "./lib/auth";
import { Role } from "./lib/types";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

async function verifyFileOwnership(
  ctx: MutationCtx,
  userId: Id<"users">,
  storageId: Id<"_storage">
): Promise<boolean> {
  // Check restaurants (logoId, coverImageId)
  const ownedRestaurants = await ctx.db
    .query("restaurants")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .collect();

  for (const r of ownedRestaurants) {
    if (r.logoId === storageId || r.coverImageId === storageId) return true;
  }

  // Check menu items in owned restaurants
  for (const r of ownedRestaurants) {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
      .collect();
    if (items.some((item) => item.imageId === storageId)) return true;

    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", r._id))
      .collect();
    if (categories.some((cat) => cat.imageId === storageId)) return true;
  }

  return false;
}

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (!isAdmin(user.role)) {
      throw new Error("Only admins can delete files directly");
    }

    // Superadmins can delete any file; CEOs must own the resource
    if (user.role !== Role.SUPERADMIN) {
      const isOwner = await verifyFileOwnership(ctx, user._id, args.storageId);
      if (!isOwner) {
        throw new Error("Not authorized to delete this file");
      }
    }

    await ctx.storage.delete(args.storageId);
  },
});

export { resolveStorageUrl, resolveImageUrl } from "./lib/storage";
