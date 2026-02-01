"use client";

import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { Role } from "@workspace/backend/lib/types";

interface AdminGuardProps {
  children: (props: {
    currentUser: Doc<"users">;
    isSuperadmin: boolean;
    isCeo: boolean;
  }) => React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSuperadmin = currentUser?.role === Role.SUPERADMIN;
  const isCeo = currentUser?.role === Role.CEO;

  if (!currentUser || (!isSuperadmin && !isCeo)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children({ currentUser, isSuperadmin, isCeo })}</>;
}
