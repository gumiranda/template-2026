"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { LayoutDashboard, UserCog, Users, LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  show: boolean;
  badge?: number;
}

export function formatBadgeCount(count: number): string {
  return count > 9 ? "9+" : String(count);
}

export function useNavigation() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser);
  const userRole = currentUser?.role;

  const isSuperadminOrCeo = userRole === "superadmin" || userRole === "ceo";

  const pendingUsersCount = useQuery(
    api.users.getPendingUsersCount,
    isSuperadminOrCeo ? {} : "skip"
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  const adminItems: NavItem[] = useMemo(() => {
    const isAdmin = userRole === "superadmin" || userRole === "ceo";
    return [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, show: true },
      { label: "Users", href: "/admin/users", icon: UserCog, show: isAdmin },
      {
        label: "Pending Users",
        href: "/admin/pending-users",
        icon: Users,
        show: isAdmin,
        badge: pendingUsersCount && pendingUsersCount > 0 ? pendingUsersCount : undefined,
      },
    ];
  }, [userRole, pendingUsersCount]);

  return {
    currentUser,
    isSuperadmin: userRole === "superadmin",
    isCeo: userRole === "ceo",
    isSuperadminOrCeo,
    pendingUsersCount,
    adminItems,
    isActive,
  };
}
