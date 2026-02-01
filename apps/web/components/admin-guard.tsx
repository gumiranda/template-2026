"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";

interface AdminGuardProps {
  children: (props: {
    currentUser: Doc<"users">;
    isSuperadmin: boolean;
    isCeo: boolean;
  }) => React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const currentUser = useQuery(api.users.getCurrentUser);

  const isSuperadmin = currentUser?.role === "superadmin";
  const isCeo = currentUser?.role === "ceo";

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
