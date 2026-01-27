"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
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
} from "lucide-react";
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

  const isRestaurantStaff =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "ceo" ||
    currentUser?.role === "waiter";

  const restaurants = useQuery(
    api.restaurants.list,
    isRestaurantStaff ? {} : "skip"
  );

  const navItems = useMemo(
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

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold">Restaurantix</h1>
      </div>
      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/restaurant" &&
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
        })}
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
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default RestaurantLayout;
