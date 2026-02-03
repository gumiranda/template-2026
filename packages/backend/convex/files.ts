import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, isAdmin } from "./lib/auth";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

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
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (!isAdmin(user.role)) {
      throw new Error("Only admins can delete files directly");
    }
    await ctx.storage.delete(args.storageId);
  },
});

// Helper to resolve a storage ID to a URL, used internally by other queries
export async function resolveStorageUrl(
  ctx: QueryCtx,
  storageId: Id<"_storage"> | undefined
): Promise<string | null> {
  if (!storageId) return null;
  return await ctx.storage.getUrl(storageId);
}

// Helper that resolves imageId with fallback to legacy imageUrl field
export async function resolveImageUrl(
  ctx: QueryCtx,
  imageId: Id<"_storage"> | undefined,
  legacyUrl: string | undefined | null
): Promise<string | null> {
  return await resolveStorageUrl(ctx, imageId) ?? legacyUrl ?? null;
}
