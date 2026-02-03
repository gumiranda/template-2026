"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

type RedirectOption = string | false;

type AuthRedirectOptions = {
  whenApproved?: RedirectOption;
  whenPending?: RedirectOption;
  whenRejected?: RedirectOption;
  whenNoUser?: RedirectOption;
  whenNoSuperadmin?: RedirectOption;
};

const defaultOptions: Required<AuthRedirectOptions> = {
  whenApproved: "/dashboard",
  whenPending: "/pending-approval",
  whenRejected: "/rejected",
  whenNoUser: "/register",
  whenNoSuperadmin: "/bootstrap",
};

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const hasSuperadmin = useQuery(api.users.hasSuperadmin);

  const whenApproved = options.whenApproved ?? defaultOptions.whenApproved;
  const whenPending = options.whenPending ?? defaultOptions.whenPending;
  const whenRejected = options.whenRejected ?? defaultOptions.whenRejected;
  const whenNoUser = options.whenNoUser ?? defaultOptions.whenNoUser;
  const whenNoSuperadmin = options.whenNoSuperadmin ?? defaultOptions.whenNoSuperadmin;

  useEffect(() => {
    if (isAuthLoading) return;

    if (hasSuperadmin === false && whenNoSuperadmin) {
      router.push(whenNoSuperadmin);
      return;
    }

    if (currentUser === null && hasSuperadmin === true && whenNoUser) {
      router.push(whenNoUser);
      return;
    }

    if (currentUser?.status === "pending" && whenPending) {
      router.push(whenPending);
      return;
    }

    if (currentUser?.status === "rejected" && whenRejected) {
      router.push(whenRejected);
      return;
    }

    if (currentUser?.status === "approved" && whenApproved) {
      router.push(whenApproved);
    }
  }, [isAuthLoading, currentUser, hasSuperadmin, router, whenApproved, whenPending, whenRejected, whenNoUser, whenNoSuperadmin]);

  const isLoading = isAuthLoading || currentUser === undefined || hasSuperadmin === undefined;

  return {
    currentUser,
    hasSuperadmin,
    isLoading,
    isAuthenticated,
  };
}
