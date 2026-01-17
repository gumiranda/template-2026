"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Clock, Loader2 } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const hasSuperadmin = useQuery(api.users.hasSuperadmin);

  useEffect(() => {
    if (hasSuperadmin === false) {
      router.push("/bootstrap");
      return;
    }

    if (currentUser === null && hasSuperadmin === true) {
      router.push("/register");
      return;
    }

    if (currentUser?.status === "approved") {
      router.push("/");
      return;
    }

    if (currentUser?.status === "rejected") {
      router.push("/rejected");
    }
  }, [currentUser, hasSuperadmin, router]);

  if (currentUser === undefined || hasSuperadmin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle>Aguardando Aprovacao</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Sua conta foi criada com sucesso! Agora voce precisa aguardar a
            aprovacao de um administrador para acessar o sistema.
          </p>
          <p className="text-sm text-muted-foreground">
            Voce recebera acesso assim que sua conta for aprovada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
