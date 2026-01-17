import type { QueryCtx, MutationCtx } from "../_generated/server";
import { Role } from "./types";

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export const isAdmin = (role?: string) =>
  role === Role.SUPERADMIN || role === Role.CEO;
