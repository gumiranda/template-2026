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

  const isSuperadmin = currentUser?.role === "superadmin";
  const isCeo = currentUser?.role === "ceo";
  const isSuperadminOrCeo = isSuperadmin || isCeo;

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

  const adminItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, show: true },
      { label: "Users", href: "/admin/users", icon: UserCog, show: isSuperadminOrCeo },
      {
        label: "Pending Users",
        href: "/admin/pending-users",
        icon: Users,
        show: isSuperadminOrCeo,
        badge: pendingUsersCount && pendingUsersCount > 0 ? pendingUsersCount : undefined,
      },
    ],
    [isSuperadminOrCeo, pendingUsersCount]
  );

  return {
    currentUser,
    isSuperadmin,
    isCeo,
    isSuperadminOrCeo,
    pendingUsersCount,
    adminItems,
    isActive,
  };
}
