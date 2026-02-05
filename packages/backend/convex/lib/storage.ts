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

type ItemWithImage = {
  imageId?: Id<"_storage">;
  imageUrl?: string | null;
};

/**
 * Batch resolves image URLs for an array of items.
 * Returns items with resolved imageUrl field.
 */
export async function resolveItemImages<T extends ItemWithImage>(
  ctx: QueryCtx,
  items: T[]
): Promise<(T & { imageUrl: string | null })[]> {
  return Promise.all(
    items.map(async (item) => {
      const imageUrl = await resolveImageUrl(ctx, item.imageId, item.imageUrl);
      return { ...item, imageUrl };
    })
  );
}
