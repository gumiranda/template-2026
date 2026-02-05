import { fetchQuery } from "convex/nextjs";
import { api } from "@workspace/backend/_generated/api";

/**
 * Server-side Convex client for use in Server Components and generateMetadata.
 * Re-exports fetchQuery pre-configured with the API.
 */
export { fetchQuery, api };
