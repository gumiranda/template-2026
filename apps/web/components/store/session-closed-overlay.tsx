"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useCloseBill } from "@/hooks/use-close-bill";
import { useCallback } from "react";

export function SessionClosedOverlay() {
  const { isClosed } = useCloseBill();

  const handleStartNewSession = useCallback(() => {
    // Clear session from sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("dine_in_session");
    }
    // Reload the page to start fresh
    window.location.reload();
  }, []);

  return (
    <Dialog open={isClosed}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Conta Fechada!
          </DialogTitle>
          <DialogDescription className="text-center">
            Obrigado pela visita! Esperamos ve-lo novamente em breve.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex justify-center">
          <Button onClick={handleStartNewSession} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Iniciar Nova Sessao
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
