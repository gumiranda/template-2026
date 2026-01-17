import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Sector, Role, UserStatus } from "./lib/types";

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const hasSuperadmin = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const superadmin = users.find((u) => u.role === Role.SUPERADMIN);
    return !!superadmin;
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
      sector: undefined,
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

    const users = await ctx.db.query("users").collect();
    const existingSuperadmin = users.find((u) => u.role === Role.SUPERADMIN);

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
    return await ctx.db.insert("users", {
      name: identity.name ?? "Superadmin",
      clerkId: clerkId,
      role: Role.SUPERADMIN,
      sector: undefined,
      status: UserStatus.APPROVED,
      approvedAt: Date.now(),
    });
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    if (currentUser.role !== Role.SUPERADMIN && currentUser.role !== Role.CEO) {
      return [];
    }

    return await ctx.db.query("users").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== Role.SUPERADMIN) {
      throw new Error("Only superadmin can change user roles");
    }

    const validRoles = Object.values(Role);
    if (!validRoles.includes(args.role as (typeof validRoles)[number])) {
      throw new Error("Invalid role");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    if (targetUser._id === currentUser._id) {
      throw new Error("Cannot change your own role");
    }

    const updateData: { role: string; sector?: string } = { role: args.role };

    if (args.role === Role.SUPERADMIN || args.role === Role.CEO) {
      updateData.sector = undefined;
    }

    await ctx.db.patch(args.userId, updateData);
    return true;
  },
});

export const updateUserSector = mutation({
  args: {
    userId: v.id("users"),
    sector: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    if (currentUser.role !== Role.SUPERADMIN && currentUser.role !== Role.CEO) {
      throw new Error("Only superadmin or CEO can change user sectors");
    }

    const validSectors = Object.values(Sector);
    if (!validSectors.includes(args.sector as (typeof validSectors)[number])) {
      throw new Error("Invalid sector");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    if (currentUser.role === Role.CEO) {
      if (targetUser.role === Role.SUPERADMIN || targetUser.role === Role.CEO) {
        throw new Error("CEO cannot modify superadmin or other CEO users");
      }
    }

    if (targetUser.role === Role.SUPERADMIN || targetUser.role === Role.CEO) {
      throw new Error("Cannot assign sector to superadmin or CEO");
    }

    await ctx.db.patch(args.userId, { sector: args.sector });
    return true;
  },
});

// ============================================
// User Approval System
// ============================================

export const getPendingUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    if (currentUser.role !== Role.SUPERADMIN && currentUser.role !== Role.CEO) {
      return [];
    }

    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter((u) => u.status === UserStatus.PENDING || u.status === undefined);
  },
});

export const getPendingUsersCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return 0;

    if (currentUser.role !== Role.SUPERADMIN && currentUser.role !== Role.CEO) {
      return 0;
    }

    const allUsers = await ctx.db.query("users").collect();
    const pending = allUsers.filter((u) => u.status === UserStatus.PENDING || u.status === undefined);
    return pending.length;
  },
});

export const approveUser = mutation({
  args: {
    userId: v.id("users"),
    sector: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    if (currentUser.role !== Role.SUPERADMIN && currentUser.role !== Role.CEO) {
      throw new Error("Not authorized to approve users");
    }

    const validSectors = Object.values(Sector);
    if (!validSectors.includes(args.sector as (typeof validSectors)[number])) {
      throw new Error("Invalid sector");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    if (targetUser.status !== UserStatus.PENDING && targetUser.status !== undefined) {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    if (currentUser.role !== Role.SUPERADMIN && currentUser.role !== Role.CEO) {
      throw new Error("Not authorized to reject users");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    if (targetUser.status !== UserStatus.PENDING && targetUser.status !== undefined) {
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

export const migrateExistingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== Role.SUPERADMIN) {
      throw new Error("Only superadmin can run migration");
    }

    const users = await ctx.db.query("users").collect();
    let migratedCount = 0;

    for (const user of users) {
      if (!user.status) {
        await ctx.db.patch(user._id, {
          status: UserStatus.APPROVED,
          approvedAt: Date.now(),
        });
        migratedCount++;
      }
    }

    return { migratedCount };
  },
});
