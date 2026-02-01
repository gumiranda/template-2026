"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@workspace/ui/components/sidebar";
import {
  LayoutDashboard,
  UserCog,
  Users,
  Building2,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser);

  const isSuperadmin = currentUser?.role === "superadmin";
  const isCeo = currentUser?.role === "ceo";
  const isSuperadminOrCeo = isSuperadmin || isCeo;

  const pendingUsersCount = useQuery(
    api.users.getPendingUsersCount,
    isSuperadminOrCeo ? {} : "skip"
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const adminItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, show: true },
    { label: "Users", href: "/admin/users", icon: UserCog, show: isSuperadminOrCeo },
    {
      label: "Pending Users",
      href: "/admin/pending-users",
      icon: Users,
      show: isSuperadminOrCeo,
      badge: pendingUsersCount && pendingUsersCount > 0 ? pendingUsersCount : undefined,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <span className="text-xl font-bold">Restaurantix</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems
                .filter((item) => item.show)
                .map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                        {item.badge > 9 ? "9+" : item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserButton />
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">
              {currentUser?.name || "User"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
