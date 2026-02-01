"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Badge } from "@workspace/ui/components/badge";
import { UserPlus } from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import Link from "next/link";
import { FullPageLoader } from "@/components/full-page-loader";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useNavigation } from "@/hooks/use-navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, isSuperadmin, isCeo, isSuperadminOrCeo, pendingUsersCount, adminItems, isActive } =
    useNavigation();

  const { hasSuperadmin, isLoading } = useAuthRedirect({
    whenApproved: undefined,
  });

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (hasSuperadmin === false || !currentUser) {
    return null;
  }

  if (currentUser.status !== "approved") {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar currentUser={currentUser} adminItems={adminItems} isActive={isActive} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <MobileNav currentUser={currentUser} adminItems={adminItems} isActive={isActive} />
            <SidebarTrigger className="hidden md:flex" />
            {(isSuperadmin || isCeo) && <RoleBadge role={currentUser.role} />}
          </div>
          <div className="flex items-center gap-4">
            {isSuperadminOrCeo && pendingUsersCount && pendingUsersCount > 0 && (
              <Link
                href="/admin/pending-users"
                className="relative flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <UserPlus className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-1 text-xs"
                >
                  {pendingUsersCount > 9 ? "9+" : pendingUsersCount}
                </Badge>
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
