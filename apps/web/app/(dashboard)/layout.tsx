"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  Shield,
  Crown,
  UserPlus,
  LayoutDashboard,
  UserCog,
  Users,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { FullPageLoader } from "@/components/full-page-loader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser);
  const hasSuperadmin = useQuery(api.users.hasSuperadmin);

  const isSuperadminOrCeo = currentUser?.role === "superadmin" || currentUser?.role === "ceo";
  const pendingUsersCount = useQuery(
    api.users.getPendingUsersCount,
    isSuperadminOrCeo ? {} : "skip"
  );

  useEffect(() => {
    if (hasSuperadmin === false) {
      router.push("/bootstrap");
      return;
    }
    if (currentUser === null && hasSuperadmin === true) {
      router.push("/register");
      return;
    }
    if (currentUser?.status === "pending") {
      router.push("/pending-approval");
      return;
    }
    if (currentUser?.status === "rejected") {
      router.push("/rejected");
      return;
    }
  }, [currentUser, hasSuperadmin, router]);

  if (currentUser === undefined || hasSuperadmin === undefined) {
    return <FullPageLoader />;
  }

  if (hasSuperadmin === false || currentUser === null) {
    return null;
  }

  if (currentUser.status !== "approved") {
    return null;
  }

  const isSuperadmin = currentUser.role === "superadmin";
  const isCeo = currentUser.role === "ceo";

  const navItems = useMemo(() => [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ...(isSuperadminOrCeo ? [
      { label: "Users", href: "/admin/users", icon: UserCog },
      { label: "Pending Users", href: "/admin/pending-users", icon: Users },
    ] : []),
  ], [isSuperadminOrCeo]);

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold">Template App</h1>
      </div>
      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
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

            {isSuperadmin && (
              <Badge variant="default" className="bg-purple-600">
                <Shield className="mr-1 h-3 w-3" />
                Superadmin
              </Badge>
            )}
            {isCeo && (
              <Badge variant="default" className="bg-amber-600">
                <Crown className="mr-1 h-3 w-3" />
                CEO
              </Badge>
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
