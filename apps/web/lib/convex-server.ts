import { fetchQuery } from "convex/nextjs";
import { api } from "@workspace/backend/_generated/api";

/**
 * Server-side Convex client for use in Server Components and generateMetadata.
 * Re-exports fetchQuery pre-configured with the API.
 */
export { fetchQuery, api };

/**
 * Fetches data for JSON-LD schema generation, returning null on failure.
 * Use this for optional schema data that shouldn't break the page if unavailable.
 *
 * @example
 * const product = await fetchForSchema(() =>
 *   fetchQuery(api.customerMenu.getProductDetails, { menuItemId: id })
 * );
 */
export async function fetchForSchema<T>(
  query: () => Promise<T>
): Promise<T | null> {
  try {
    return await query();
  } catch {
    return null;
  }
}
