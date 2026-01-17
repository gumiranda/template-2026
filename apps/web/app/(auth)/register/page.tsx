"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registerAttempted = useRef(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const hasSuperadmin = useQuery(api.users.hasSuperadmin);
  const addUser = useMutation(api.users.add);

  useEffect(() => {
    if (hasSuperadmin === false) {
      router.push("/bootstrap");
      return;
    }
  }, [hasSuperadmin, router]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.status === "pending") {
        router.push("/pending-approval");
      } else if (currentUser.status === "rejected") {
        router.push("/rejected");
      } else if (currentUser.status === "approved") {
        router.push("/");
      }
    }
  }, [currentUser, router]);

  // Auto-register when user doesn't exist
  useEffect(() => {
    const autoRegister = async () => {
      if (
        hasSuperadmin === true &&
        currentUser === null &&
        !registerAttempted.current
      ) {
        registerAttempted.current = true;
        setIsLoading(true);
        try {
          await addUser({});
          router.push("/pending-approval");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Erro ao registrar");
          setIsLoading(false);
        }
      }
    };
    autoRegister();
  }, [hasSuperadmin, currentUser, addUser, router]);

  if (hasSuperadmin === undefined || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Criando sua conta...</p>
      </div>
    );
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
