import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { Role, UserStatus } from "./types";

type AuthOptions = {
  requireApproved?: boolean;
};

export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx,
  options: AuthOptions = {}
) {
  const { requireApproved = false } = options;

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) return null;

  if (requireApproved && user.status !== UserStatus.APPROVED) {
    return null;
  }

  return user;
}

// Helper for mutations requiring approved users
export async function getApprovedUser(ctx: QueryCtx | MutationCtx) {
  return getAuthenticatedUser(ctx, { requireApproved: true });
}

export const isAdmin = (role?: string) =>
  role === Role.SUPERADMIN || role === Role.CEO;

export const isRestaurantStaff = (role?: string) =>
  role === Role.SUPERADMIN || role === Role.CEO || role === Role.WAITER;

export function canModifyRestaurant(
  user: { _id: Id<"users">; role?: string },
  restaurant: { ownerId: Id<"users"> }
): boolean {
  if (restaurant.ownerId === user._id) return true;
  return isAdmin(user.role);
}

/**
 * Check if a user can manage a specific restaurant.
 * Returns true if user is SUPERADMIN or owns the restaurant.
 */
export async function canManageRestaurant(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  restaurantId: Id<"restaurants">
): Promise<boolean> {
  const user = await ctx.db.get(userId);
  if (!user) return false;

  // SUPERADMIN can manage any restaurant
  if (user.role === Role.SUPERADMIN) return true;

  // Check if user owns the restaurant
  const restaurant = await ctx.db.get(restaurantId);
  if (!restaurant) return false;

  return restaurant.ownerId === userId;
}

/**
 * Require authentication. Throws if user is not authenticated.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>> {
  const user = await getAuthenticatedUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require authentication and restaurant access.
 * Throws if user is not authenticated or doesn't have access to the restaurant.
 */
export async function requireRestaurantAccess(
  ctx: QueryCtx | MutationCtx,
  restaurantId: Id<"restaurants">
): Promise<NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>> {
  const user = await requireAuth(ctx);

  const canManage = await canManageRestaurant(ctx, user._id, restaurantId);
  if (!canManage) {
    throw new Error("Access denied: You don't have permission to manage this restaurant");
  }

  return user;
}