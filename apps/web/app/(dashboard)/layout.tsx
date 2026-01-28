"use client";

import { useMemo, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  UserPlus,
  LayoutDashboard,
  UserCog,
  Users,
  Menu,
  Building2,
  ShoppingCart,
  Utensils,
  QrCode,
  Settings,
} from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { FullPageLoader } from "@/components/full-page-loader";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";


const Layout = ({ children }: { children: React.ReactNode }) => {
 
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser)
 
  const { hasSuperadmin, isLoading } = useAuthRedirect({
    whenApproved: undefined,
  });
 const isSuperadmin = currentUser?.role === "superadmin";
  const isCeo = currentUser?.role === "ceo";
  const isSuperadminOrCeo = currentUser?.role === "superadmin" || currentUser?.role === "ceo";
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

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (hasSuperadmin === false || !currentUser) {
    return null;
  }

  if (currentUser.status !== "approved") {
    return null;
  }

  

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="fixed top-0 left-0 p-6 z-50">
        <Link href={"/"}>
        <h1 className="text-xl font-bold flex items-start">Restaurantix</h1>
        </Link>
      </div>
      <nav className="flex items-center px-4 space-x-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
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
      <aside className="fixed top-0 left-0 w-full h-16 flex items-center justify-center bg-white shadow z-50">
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

            {(isSuperadmin || isCeo) && (
              <RoleBadge role={currentUser.role} />
            )}
          </div>
          <div className="flex items-center gap-4">
            {(isSuperadmin || isCeo) && pendingUsersCount && pendingUsersCount > 0 && (
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

export default Layout;
