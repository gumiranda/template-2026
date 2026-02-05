"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Receipt, Loader2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

interface BillRequestsPanelProps {
  restaurantId: Id<"restaurants">;
}

export function BillRequestsPanel({ restaurantId }: BillRequestsPanelProps) {
  const billRequests = useQuery(api.billManagement.getBillRequests, {
    restaurantId,
  });
  const settleBill = useMutation(api.billManagement.settleBill);
  const [settlingSessionId, setSettlingSessionId] = useState<string | null>(null);

  const handleSettleBill = useCallback(
    async (sessionId: string) => {
      setSettlingSessionId(sessionId);
      try {
        const result = await settleBill({ sessionId, restaurantId });
        if (result.alreadyClosed) {
          toast.info("Conta ja foi fechada");
        } else {
          toast.success("Conta fechada com sucesso");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao fechar conta"
        );
      } finally {
        setSettlingSessionId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [restaurantId]
  );

  const requestCount = billRequests?.length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5" />
            Solicitacoes de Conta
          </CardTitle>
          {requestCount > 0 && (
            <Badge variant="secondary">{requestCount}</Badge>
          )}
        </div>
        <CardDescription>
          Mesas aguardando fechamento de conta
        </CardDescription>
      </CardHeader>

      <CardContent>
        {billRequests === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : billRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma solicitacao pendente
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {billRequests.map((request, index) => (
              <div key={request.sessionId}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Mesa {request.tableNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.orderCount}{" "}
                      {request.orderCount === 1 ? "pedido" : "pedidos"} -{" "}
                      {formatCurrency(request.total)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSettleBill(request.sessionId)}
                    disabled={settlingSessionId === request.sessionId}
                  >
                    {settlingSessionId === request.sessionId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Fechar Conta"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
