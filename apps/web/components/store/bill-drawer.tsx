"use client";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Separator } from "@workspace/ui/components/separator";
import { Receipt, Clock, Loader2, CheckCircle2, X } from "lucide-react";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useSessionBill } from "@/hooks/use-session-bill";
import { useCloseBill } from "@/hooks/use-close-bill";
import { formatCurrency, formatTime } from "@/lib/format";
import { cn } from "@workspace/ui/lib/utils";
import { getStatusConfig } from "@/app/(dashboard)/admin/tenants/[id]/orders/_components/orders-types";
import { DrawerSheet } from "@/components/ui/drawer-sheet";

interface BillDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillDrawer({ open, onOpenChange }: BillDrawerProps) {
  const orderContext = useAtomValue(orderContextAtom);
  const sessionId =
    orderContext.type === "dine_in" ? orderContext.sessionId : null;
  const { orders, totalBill, itemCount } = useSessionBill(sessionId);
  const { isRequestingClosure, isClosed, requestCloseBill, cancelRequest } =
    useCloseBill();

  const tableNumber =
    orderContext.type === "dine_in" ? orderContext.tableNumber : "";

  return (
    <DrawerSheet
      open={open}
      onOpenChange={onOpenChange}
      isEmpty={orders.length === 0}
      icon={Receipt}
      title={`Conta - Mesa ${tableNumber}`}
    >
      <DrawerSheet.Content>
        <DrawerSheet.Header aria-label={`Conta da mesa ${tableNumber}`} />

        <DrawerSheet.Empty>
          <p>Nenhum pedido enviado ainda</p>
        </DrawerSheet.Empty>

        <DrawerSheet.InfoBar>
          <span className="text-sm text-muted-foreground">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} (
            {itemCount} {itemCount === 1 ? "item" : "itens"})
          </span>
        </DrawerSheet.InfoBar>

        <DrawerSheet.Body>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div key={order._id} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(order.createdAt)}</span>
                  </div>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className={cn(
                          "flex-1",
                          order.status === "canceled" &&
                            "text-muted-foreground line-through"
                        )}
                      >
                        {item.quantity}x {item.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0",
                          order.status === "canceled" &&
                            "text-muted-foreground line-through"
                        )}
                      >
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-sm font-medium">
                  <span>Subtotal</span>
                  <span
                    className={
                      order.status === "canceled"
                        ? "text-muted-foreground line-through"
                        : ""
                    }
                  >
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </DrawerSheet.Body>

        <DrawerSheet.Summary>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalBill)}</span>
          </div>
        </DrawerSheet.Summary>

        <BillActionSection
          isClosed={isClosed}
          isRequestingClosure={isRequestingClosure}
          requestCloseBill={requestCloseBill}
          cancelRequest={cancelRequest}
          isEmpty={orders.length === 0}
        />
      </DrawerSheet.Content>
    </DrawerSheet>
  );
}

interface BillActionSectionProps {
  isClosed: boolean;
  isRequestingClosure: boolean;
  requestCloseBill: () => void;
  cancelRequest: () => void;
  isEmpty: boolean;
}

function BillActionSection({
  isClosed,
  isRequestingClosure,
  requestCloseBill,
  cancelRequest,
  isEmpty,
}: BillActionSectionProps) {
  if (isEmpty) return null;

  if (isClosed) {
    return (
      <div className="px-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Conta fechada com sucesso!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isRequestingClosure) {
    return (
      <div className="space-y-3 px-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Aguardando garçom fechar a conta...
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={cancelRequest}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar Solicitação
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4">
      <Button className="w-full" size="lg" onClick={requestCloseBill}>
        Fechar Conta
      </Button>
    </div>
  );
}
