import { query } from "./_generated/server";
import { Role } from "./lib/types";
import { getAuthenticatedUser, isAdmin } from "./lib/auth";

export const getMenuItems = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return [];
    }

    const baseMenu = [
      { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
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
      isWaiter: user.role === Role.WAITER,
      canManageUsers: userIsAdmin,
    };
  },
});
