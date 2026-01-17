"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Loader2 } from "lucide-react";

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
  // Criar superadmin automaticamente se não existir nenhum usuário
  useEffect(() => {
    const autoBootstrap = async () => {
      if (isSignedIn && !hasAnyUsers && !bootstrapAttempted.current) {
        bootstrapAttempted.current = true;
        try {
          await bootstrap();
          router.push("/");
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Erro ao criar superadmin",
          );
        }
      }
    };
    autoBootstrap();
  }, [isSignedIn, hasAnyUsers, bootstrap, router]);

  // Se já existe usuário atual, redirecionar para home
  useEffect(() => {
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  // Loading state
  if (!isLoaded || hasAnyUsers === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  // Mostrar loading enquanto cria o superadmin
  if (hasAnyUsers === false && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Criando superadmin...</p>
      </div>
    );
  }

  // Mostrar erro se houver
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
