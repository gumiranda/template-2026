import { v } from "convex/values";
import { query } from "./_generated/server";
import { Role } from "./lib/types";
import { getAuthenticatedUser, isAdmin } from "./lib/auth";

export const checkPermission = query({
  args: {
    entityType: v.string(),
    action: v.string(),
  },
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return { allowed: false, reason: "Not authenticated" };
    }

    if (isAdmin(user.role)) {
      return {
        allowed: true,
        reason: "Full access granted",
        role: user.role,
      };
    }

    return {
      allowed: true,
      reason: "Access granted",
      role: user.role || Role.USER,
    };
  },
});

export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    return {
      role: user.role || Role.USER,
      isAdmin: isAdmin(user.role),
      isSuperadmin: user.role === Role.SUPERADMIN,
      isCeo: user.role === Role.CEO,
    };
  },
});

export const getMenuItems = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return [];
    }

    const baseMenu = [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Analytics", href: "/analytics", icon: "BarChart3" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ];

    if (isAdmin(user.role)) {
      return [
        ...baseMenu,
        { label: "Users", href: "/admin/users", icon: "UserCog" },
        { label: "Pending Users", href: "/admin/pending-users", icon: "UserPlus" },
      ];
    }

    return baseMenu;
  },
});

export const getCurrentUserPermissions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const userIsAdmin = isAdmin(user.role);

    return {
      role: user.role || Role.USER,
      isAdmin: userIsAdmin,
      isSuperadmin: user.role === Role.SUPERADMIN,
      isCeo: user.role === Role.CEO,
      canManageUsers: userIsAdmin,
    };
  },
});
