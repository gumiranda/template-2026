"use client";

import { useEffect, useRef } from "react";
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

type ResolvedOptions = Required<AuthRedirectOptions>;

type RedirectContext = {
  currentUser: { status?: string } | null | undefined;
  hasSuperadmin: boolean | undefined;
};

function resolveRedirectTarget(
  ctx: RedirectContext,
  opts: ResolvedOptions
): string | false {
  const { currentUser, hasSuperadmin } = ctx;

  if (hasSuperadmin === false && opts.whenNoSuperadmin) return opts.whenNoSuperadmin;
  if (currentUser === null && hasSuperadmin === true && opts.whenNoUser) return opts.whenNoUser;
  if (currentUser?.status === "pending" && opts.whenPending) return opts.whenPending;
  if (currentUser?.status === "rejected" && opts.whenRejected) return opts.whenRejected;
  if (currentUser?.status === "approved" && opts.whenApproved) return opts.whenApproved;

  return false;
}

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const hasSuperadmin = useQuery(api.users.hasSuperadmin);

  const resolved: ResolvedOptions = {
    whenApproved: options.whenApproved ?? defaultOptions.whenApproved,
    whenPending: options.whenPending ?? defaultOptions.whenPending,
    whenRejected: options.whenRejected ?? defaultOptions.whenRejected,
    whenNoUser: options.whenNoUser ?? defaultOptions.whenNoUser,
    whenNoSuperadmin: options.whenNoSuperadmin ?? defaultOptions.whenNoSuperadmin,
  };

  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading || redirectedRef.current) return;

    const target = resolveRedirectTarget({ currentUser, hasSuperadmin }, resolved);
    if (target) {
      redirectedRef.current = true;
      router.push(target);
    }
  }, [isAuthLoading, currentUser, hasSuperadmin, router, resolved.whenApproved, resolved.whenPending, resolved.whenRejected, resolved.whenNoUser, resolved.whenNoSuperadmin]);

  const isLoading = isAuthLoading || currentUser === undefined || hasSuperadmin === undefined;

  return {
    currentUser,
    hasSuperadmin,
    isLoading,
    isAuthenticated,
  };
}
