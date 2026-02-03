import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Role, UserStatus, isValidSector } from "./lib/types";
import { getAuthenticatedUser, isAdmin } from "./lib/auth";

async function fetchPendingUsers(ctx: QueryCtx) {
  const [pendingUsers, noStatusUsers] = await Promise.all([
    ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", UserStatus.PENDING))
      .collect(),
    ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", undefined))
      .collect(),
  ]);
  return [...pendingUsers, ...noStatusUsers];
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return getAuthenticatedUser(ctx);
  },
});

export const hasSuperadmin = query({
  args: {},
  handler: async (ctx) => {
    const superadmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", Role.SUPERADMIN))
      .first();
    return superadmin !== null;
  },
});

export const hasAnyUsers = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    return user !== null;
  },
});

export const add = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      name: identity.name ?? "Unknown",
      clerkId: clerkId,
      role: Role.USER,
      status: UserStatus.PENDING,
    });

    return userId;
  },
});

export const bootstrap = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingSuperadmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", Role.SUPERADMIN))
      .first();

    if (existingSuperadmin) {
      throw new Error("Superadmin already exists");
    }

    const clerkId = identity.subject;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUserId = await ctx.db.insert("users", {
      name: identity.name ?? "Superadmin",
      clerkId: clerkId,
      role: Role.SUPERADMIN,
      status: UserStatus.APPROVED,
      approvedAt: Date.now(),
    });

    const allSuperadmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", Role.SUPERADMIN))
      .collect();

    if (allSuperadmins.length > 1) {
      await ctx.db.delete(newUserId);
      throw new Error("Race condition detected. Please try again.");
    }

    return newUserId;
  },
});

export const getAllUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const result = await ctx.db
      .query("users")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(({ clerkId, ...safeUser }) => safeUser),
    };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("superadmin"),
      v.literal("ceo"),
      v.literal("user"),
      v.literal("waiter")
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || currentUser.role !== Role.SUPERADMIN) {
      throw new Error("Only superadmin can change user roles");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    if (targetUser._id === currentUser._id) {
      throw new Error("Cannot change your own role");
    }

    // SUPERADMIN and CEO roles have global access, so sector assignment is not applicable
    if (args.role === Role.SUPERADMIN || args.role === Role.CEO) {
      await ctx.db.patch(args.userId, { role: args.role, sector: undefined });
    } else {
      await ctx.db.patch(args.userId, { role: args.role });
    }

    return true;
  },
});

export const updateUserSector = mutation({
  args: {
    userId: v.id("users"),
    sector: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (!isAdmin(currentUser.role)) {
      throw new Error("Only superadmin or CEO can change user sectors");
    }

    if (!isValidSector(args.sector)) {
      throw new Error("Invalid sector");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    if (currentUser.role === Role.CEO && isAdmin(targetUser.role)) {
      throw new Error("CEO cannot modify superadmin or other CEO users");
    }

    if (isAdmin(targetUser.role)) {
      throw new Error("Cannot assign sector to superadmin or CEO");
    }

    await ctx.db.patch(args.userId, { sector: args.sector });
    return true;
  },
});

export const getPendingUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) return [];

    return fetchPendingUsers(ctx);
  },
});

export const getPendingUsersCount = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser || !isAdmin(currentUser.role)) return 0;

    const pendingUsers = await fetchPendingUsers(ctx);
    return pendingUsers.length;
  },
});

export const approveUser = mutation({
  args: {
    userId: v.id("users"),
    sector: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (!isAdmin(currentUser.role)) {
      throw new Error("Not authorized to approve users");
    }

    if (!isValidSector(args.sector)) {
      throw new Error("Invalid sector");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const isPending = targetUser.status === UserStatus.PENDING || targetUser.status === undefined;
    if (!isPending) {
      throw new Error("User is not pending approval");
    }

    await ctx.db.patch(args.userId, {
      status: UserStatus.APPROVED,
      sector: args.sector,
      approvedBy: currentUser._id,
      approvedAt: Date.now(),
    });

    return true;
  },
});

export const rejectUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    if (!isAdmin(currentUser.role)) {
      throw new Error("Not authorized to reject users");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const isPending = targetUser.status === UserStatus.PENDING || targetUser.status === undefined;
    if (!isPending) {
      throw new Error("User is not pending approval");
    }

    await ctx.db.patch(args.userId, {
      status: UserStatus.REJECTED,
      rejectedBy: currentUser._id,
      rejectedAt: Date.now(),
      rejectionReason: args.reason,
    });

    return true;
  },
});

export const migrateExistingUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const usersWithoutStatus = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", undefined))
      .collect();
    let migratedCount = 0;

    for (const user of usersWithoutStatus) {
      await ctx.db.patch(user._id, {
        status: UserStatus.APPROVED,
        approvedAt: Date.now(),
      });
      migratedCount++;
    }

    return { migratedCount };
  },
});
