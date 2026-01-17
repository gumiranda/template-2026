"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { XCircle, Loader2 } from "lucide-react";

export default function RejectedPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (currentUser?.status === "approved") {
      router.push("/");
    } else if (currentUser?.status === "pending") {
      router.push("/pending-approval");
    }
  }, [currentUser, router]);

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Infelizmente, sua solicitacao de acesso foi rejeitada.
          </p>
          {currentUser?.rejectionReason && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Motivo:</p>
              <p className="text-sm text-muted-foreground">
                {currentUser.rejectionReason}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Se voce acredita que isso foi um erro, entre em contato com o
            administrador do sistema.
          </p>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
