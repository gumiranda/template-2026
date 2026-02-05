"use client";

import { useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { toast } from "sonner";

type SessionStatus = "open" | "requesting_closure" | "closed";

export function useCloseBill() {
  const orderContext = useAtomValue(orderContextAtom);
  const sessionId = orderContext.type === "dine_in" ? orderContext.sessionId : null;

  const sessionStatus = useQuery(
    api.billManagement.getSessionStatus,
    sessionId ? { sessionId } : "skip"
  );

  const requestCloseBillMutation = useMutation(api.billManagement.requestCloseBill);
  const cancelCloseBillRequestMutation = useMutation(api.billManagement.cancelCloseBillRequest);

  const status: SessionStatus = sessionStatus?.status ?? "open";
  const isRequestingClosure = status === "requesting_closure";
  const isClosed = status === "closed";

  const requestCloseBill = useCallback(async () => {
    if (!sessionId) {
      toast.error("Sessao nao encontrada");
      return;
    }

    try {
      await requestCloseBillMutation({ sessionId });
      toast.success("Solicitacao de fechamento enviada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao solicitar fechamento"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const cancelRequest = useCallback(async () => {
    if (!sessionId) {
      toast.error("Sessao nao encontrada");
      return;
    }

    try {
      await cancelCloseBillRequestMutation({ sessionId });
      toast.success("Solicitacao cancelada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cancelar solicitacao"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return {
    status,
    isRequestingClosure,
    isClosed,
    isLoading: sessionStatus === undefined && sessionId !== null,
    requestCloseBill,
    cancelRequest,
  };
}
