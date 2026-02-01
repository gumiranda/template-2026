"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Badge } from "@workspace/ui/components/badge";
import { UserPlus } from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import { AppSidebar } from "@/components/app-sidebar";
import Link from "next/link";
import { FullPageLoader } from "@/components/full-page-loader";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useQuery(api.users.getCurrentUser);

  const { hasSuperadmin, isLoading } = useAuthRedirect({
    whenApproved: undefined,
  });

  const isSuperadmin = currentUser?.role === "superadmin";
  const isCeo = currentUser?.role === "ceo";
  const isSuperadminOrCeo = isSuperadmin || isCeo;

  const pendingUsersCount = useQuery(
    api.users.getPendingUsersCount,
    isSuperadminOrCeo ? {} : "skip"
  );

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
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
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
};

export default Layout;
