"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const syncAfterSuccess = useAction(api.stripe.syncAfterSuccess);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (sessionId && !synced) {
      syncAfterSuccess({ sessionId })
        .then(() => setSynced(true))
        .catch(console.error);
    }
  }, [sessionId, synced, syncAfterSuccess]);

  return synced ? (
    <div className="space-y-4">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-bold">Assinatura ativada!</h1>
      <p className="text-muted-foreground">
        Sua assinatura foi ativada com sucesso.
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <Button asChild>
          <Link href="/">Ir para a loja</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/subscription">Ver assinatura</Link>
        </Button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
      <h1 className="text-2xl font-bold">Processando...</h1>
      <p className="text-muted-foreground">
        Estamos ativando sua assinatura. Aguarde um momento.
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Carregando...</h1>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
