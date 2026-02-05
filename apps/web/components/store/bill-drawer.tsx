"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Badge } from "@workspace/ui/components/badge";
import { Receipt, Clock } from "lucide-react";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useSessionBill } from "@/hooks/use-session-bill";
import { formatCurrency } from "@/lib/format";
import { cn } from "@workspace/ui/lib/utils";
import { getStatusConfig } from "@/app/(dashboard)/admin/tenants/[id]/orders/_components/orders-types";

interface BillDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseBill?: () => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BillDrawer({ open, onOpenChange, onCloseBill }: BillDrawerProps) {
  const orderContext = useAtomValue(orderContextAtom);
  const sessionId = orderContext.type === "dine_in" ? orderContext.sessionId : null;
  const { orders, totalBill, itemCount } = useSessionBill(sessionId);

  const tableNumber = orderContext.type === "dine_in" ? orderContext.tableNumber : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Conta - Mesa {tableNumber}
          </SheetTitle>
        </SheetHeader>

        {orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <Receipt className="h-16 w-16" />
            <p>Nenhum pedido enviado ainda</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} ({itemCount}{" "}
                {itemCount === 1 ? "item" : "itens"})
              </span>
            </div>

            <Separator />

            <ScrollArea className="flex-1">
              <div className="space-y-4 py-4">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div key={order._id} className="space-y-2 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(order.createdAt)}</span>
                        </div>
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className={cn(
                              "flex-1",
                              order.status === "canceled" && "text-muted-foreground line-through"
                            )}>
                              {item.quantity}x {item.name}
                            </span>
                            <span className={cn(
                              "shrink-0",
                              order.status === "canceled" && "text-muted-foreground line-through"
                            )}>
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-sm font-medium">
                        <span>Subtotal</span>
                        <span className={order.status === "canceled" ? "text-muted-foreground line-through" : ""}>
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-2 py-4 text-sm">
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalBill)}</span>
              </div>
            </div>

            {onCloseBill && (
              <Button className="w-full" size="lg" onClick={onCloseBill}>
                Fechar Conta
              </Button>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
