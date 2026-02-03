"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import { FullPageLoader } from "@/components/full-page-loader";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

export default function RegisterPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registerAttempted = useRef(false);

  const { currentUser, hasSuperadmin, isLoading, isAuthenticated } = useAuthRedirect({
    whenNoUser: false,
    whenApproved: "/",
    whenPending: "/pending-approval",
    whenRejected: "/rejected",
  });

  const addUser = useMutation(api.users.add);

  useEffect(() => {
    const autoRegister = async () => {
      if (
        isAuthenticated &&
        hasSuperadmin === true &&
        currentUser === null &&
        !registerAttempted.current
      ) {
        registerAttempted.current = true;
        setIsRegistering(true);
        try {
          await addUser({});
          router.push("/pending-approval");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error registering");
          setIsRegistering(false);
        }
      }
    };
    autoRegister();
  }, [isAuthenticated, hasSuperadmin, currentUser, addUser, router]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isRegistering) {
    return <FullPageLoader message="Creating your account..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
