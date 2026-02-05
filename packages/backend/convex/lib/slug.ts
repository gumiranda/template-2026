/**
 * Slug generation utilities for SEO-friendly URLs
 */

/**
 * Generates a URL-friendly slug from a string.
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start/end
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens from start/end
}

/**
 * Generates a unique slug by appending a suffix if the base slug already exists.
 * @param baseSlug - The initial slug to check
 * @param existingSlugs - Set of slugs that already exist
 * @returns A unique slug
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: Set<string>
): string {
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.has(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}
