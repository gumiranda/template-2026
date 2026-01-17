/**
 * Permission Control Functions
 * Implements role-based access control
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { Role } from "./lib/types";

/**
 * Check if user has permission for an action
 */
export const checkPermission = query({
  args: {
    entityType: v.string(),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { allowed: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    // Superadmin and CEO have full access
    if (user.role === Role.SUPERADMIN || user.role === Role.CEO) {
      return {
        allowed: true,
        reason: "Full access granted",
        role: user.role,
      };
    }

    // Regular users have basic access
    return {
      allowed: true,
      reason: "Access granted",
      role: user.role || Role.USER,
    };
  },
});

/**
 * Get user's role
 */
export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    return {
      role: user.role || Role.USER,
      isAdmin: user.role === Role.SUPERADMIN || user.role === Role.CEO,
      isSuperadmin: user.role === Role.SUPERADMIN,
      isCeo: user.role === Role.CEO,
    };
  },
});

/**
 * Get menu items based on user role
 */
export const getMenuItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Base menu for all users
    const baseMenu = [
      { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
    ];

    // Admin menu items
    if (user.role === Role.SUPERADMIN || user.role === Role.CEO) {
      return [
        ...baseMenu,
        { label: "Users", href: "/admin/users", icon: "UserCog" },
        { label: "Pending Users", href: "/admin/pending-users", icon: "UserPlus" },
      ];
    }

    return baseMenu;
  },
});

/**
 * Get permissions for current user
 */
export const getCurrentUserPermissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const isAdmin = user.role === Role.SUPERADMIN || user.role === Role.CEO;

    return {
      role: user.role || Role.USER,
      isAdmin,
      isSuperadmin: user.role === Role.SUPERADMIN,
      isCeo: user.role === Role.CEO,
      canManageUsers: isAdmin,
    };
  },
});
