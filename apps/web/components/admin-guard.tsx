"use client";

/**
 * AdminGuard is a UI-ONLY guard that hides admin content from non-admin users.
 *
 * SECURITY NOTE: This component provides NO security guarantees. It only improves UX
 * by hiding UI elements. All backend endpoints MUST independently validate permissions.
 * A malicious user can bypass this guard by calling APIs directly or modifying client code.
 */

import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { Role } from "@workspace/backend/lib/types";

interface AdminGuardRenderProps {
  currentUser: Doc<"users">;
  isSuperadmin: boolean;
  isCeo: boolean;
}

interface AdminGuardProps {
  children: (props: AdminGuardRenderProps) => React.ReactNode;
}

const CenteredContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[400px] items-center justify-center">{children}</div>
);

export function AdminGuard({ children }: AdminGuardProps) {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <CenteredContainer>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CenteredContainer>
    );
  }

  if (!currentUser) {
    return (
      <CenteredContainer>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
      </CenteredContainer>
    );
  }

  const isSuperadmin = currentUser.role === Role.SUPERADMIN;
  const isCeo = currentUser.role === Role.CEO;

  if (!isSuperadmin && !isCeo) {
    return (
      <CenteredContainer>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
      </CenteredContainer>
    );
  }

  return <>{children({ currentUser, isSuperadmin, isCeo })}</>;
}
