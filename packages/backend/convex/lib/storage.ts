import type { QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

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
  return (await resolveStorageUrl(ctx, imageId)) ?? legacyUrl ?? null;
}
