"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Settings,
  QrCode,
  Menu,
  UserCog,
  Users,
  UserPlus,
  Building2,
} from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { FullPageLoader } from "@/components/full-page-loader";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

const RestaurantLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { currentUser, isLoading } = useAuthRedirect({
    whenApproved: "/restaurant",
  });

  const isSuperadmin = currentUser?.role === "superadmin";
  const isCeo = currentUser?.role === "ceo";
  const isSuperadminOrCeo = isSuperadmin || isCeo;

  const isRestaurantStaff =
    isSuperadmin || isCeo || currentUser?.role === "waiter";

  const restaurants = useQuery(
    api.restaurants.list,
    isRestaurantStaff ? {} : "skip"
  );

  const pendingUsersCount = useQuery(
    api.users.getPendingUsersCount,
    isSuperadminOrCeo ? {} : "skip"
  );

  const adminNavItems = useMemo(() => [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ...(isSuperadminOrCeo ? [
      { label: "Users", href: "/admin/users", icon: UserCog },
      { label: "Pending Users", href: "/admin/pending-users", icon: Users },
    ] : []),
    ...(isSuperadmin ? [
      { label: "Restaurants", href: "/admin/restaurants", icon: Building2 },
    ] : []),
  ], [isSuperadminOrCeo, isSuperadmin]);

  const restaurantNavItems = useMemo(
    () => [
      { label: "Dashboard", href: "/restaurant", icon: LayoutDashboard },
      { label: "Orders", href: "/restaurant/orders", icon: ShoppingCart },
      { label: "Tables", href: "/restaurant/tables", icon: Utensils },
      { label: "Menu", href: "/restaurant/menu", icon: Menu },
      { label: "QR Codes", href: "/restaurant/qr-codes", icon: QrCode },
      { label: "Settings", href: "/restaurant/settings", icon: Settings },
    ],
    []
  );

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!currentUser || !isRestaurantStaff) {
    return null;
  }

  if (currentUser.status !== "approved") {
    return null;
  }

  const renderNavItems = (items: typeof restaurantNavItems, onNavigate?: () => void) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive =
        pathname === item.href ||
        (item.href !== "/" && item.href !== "/restaurant" &&
          pathname.startsWith(item.href));
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold">Restaurantix</h1>
      </div>
      <nav className="px-4 space-y-1">
        {isSuperadminOrCeo && (
          <>
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            {renderNavItems(adminNavItems, onNavigate)}
            <div className="my-2 border-t" />
          </>
        )}
        {isSuperadminOrCeo && (
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Restaurant
          </p>
        )}
        {renderNavItems(restaurantNavItems, onNavigate)}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-64 border-r bg-muted/40">
        <SidebarContent />
      </aside>

      <div className="flex-1">
        <header className="h-14 border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            {isSuperadminOrCeo && (
              <RoleBadge role={currentUser.role} />
            )}
          </div>
          <div className="flex items-center gap-4">
            {isSuperadminOrCeo && pendingUsersCount && pendingUsersCount > 0 && (
              <Link href="/admin/pending-users">
                <Button variant="ghost" size="icon" className="relative">
                  <UserPlus className="h-5 w-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {pendingUsersCount > 9 ? "9+" : pendingUsersCount}
                  </Badge>
                </Button>
              </Link>
            )}
            <UserButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default RestaurantLayout;
