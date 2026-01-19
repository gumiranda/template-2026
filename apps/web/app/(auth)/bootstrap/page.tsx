"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { FullPageLoader } from "@/components/full-page-loader";

export default function BootstrapPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const bootstrapAttempted = useRef(false);

  const hasAnyUsers = useQuery(api.users.hasAnyUsers, isSignedIn ? {} : "skip");
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn ? {} : "skip",
  );
  const bootstrap = useMutation(api.users.bootstrap);
  useEffect(() => {
    const autoBootstrap = async () => {
      if (isSignedIn && hasAnyUsers === false && !bootstrapAttempted.current) {
        bootstrapAttempted.current = true;
        try {
          await bootstrap();
          router.push("/");
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error creating superadmin",
          );
        }
      }
    };
    autoBootstrap();
  }, [isSignedIn, hasAnyUsers, bootstrap, router]);
  useEffect(() => {
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  if (!isLoaded || hasAnyUsers === undefined) {
    return <FullPageLoader />;
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (hasAnyUsers === false && !error) {
    return <FullPageLoader message="Creating superadmin..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return null;
}
