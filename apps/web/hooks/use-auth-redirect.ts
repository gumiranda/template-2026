"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

type AuthRedirectOptions = {
  whenApproved?: string;
  whenPending?: string;
  whenRejected?: string;
  whenNoUser?: string;
  whenNoSuperadmin?: string;
};

const defaultOptions: AuthRedirectOptions = {
  whenApproved: "/dashboard",
  whenPending: "/pending-approval",
  whenRejected: "/rejected",
  whenNoUser: "/register",
  whenNoSuperadmin: "/bootstrap",
};

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const hasSuperadmin = useQuery(api.users.hasSuperadmin);

  const whenApproved = options.whenApproved ?? defaultOptions.whenApproved;
  const whenPending = options.whenPending ?? defaultOptions.whenPending;
  const whenRejected = options.whenRejected ?? defaultOptions.whenRejected;
  const whenNoUser = options.whenNoUser ?? defaultOptions.whenNoUser;
  const whenNoSuperadmin = options.whenNoSuperadmin ?? defaultOptions.whenNoSuperadmin;

  useEffect(() => {
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
  }, [currentUser, hasSuperadmin, router, whenApproved, whenPending, whenRejected, whenNoUser, whenNoSuperadmin]);

  const isLoading = currentUser === undefined || hasSuperadmin === undefined;

  return {
    currentUser,
    hasSuperadmin,
    isLoading,
  };
}
