"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ChevronDown, ChevronUp, UtensilsCrossed, Truck, CheckCircle2, Receipt, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { formatCurrency } from "@/lib/format";
import { getStatusConfig, type OrderStatusType, type TableGroup } from "./orders-types";
import { OrderStatusSelect } from "./order-status-select";
import { toast } from "sonner";

const MAX_VISIBLE_ITEMS = 3;

function formatShortId(id: string): string {
  return id.slice(-6).toUpperCase();
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

interface TableGroupCardProps {
  group: TableGroup;
  restaurantId: Id<"restaurants">;
  onStatusChange: (orderId: string, newStatus: OrderStatusType) => void;
  updatingOrderId: string | null;
}

export function TableGroupCard({
  group,
  restaurantId,
  onStatusChange,
  updatingOrderId,
}: TableGroupCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [isSettling, setIsSettling] = useState(false);
  const settleBill = useMutation(api.billManagement.settleBill);

  const isDelivery = group.tableNumber === null;
  const canSettle = !isDelivery && group.sessionId && !group.sessionClosed;
  const Icon = isDelivery ? Truck : UtensilsCrossed;

  const handleSettleBill = useCallback(async () => {
    if (!group.sessionId) return;
    setIsSettling(true);
    try {
      await settleBill({ sessionId: group.sessionId, restaurantId });
      toast.success("Conta fechada com sucesso");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fechar conta"
      );
    } finally {
      setIsSettling(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.sessionId, restaurantId]);

  return (
    <Card className={cn(group.sessionClosed && "opacity-60")}>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between px-4 py-3 h-auto"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-base">{group.label}</span>
          <Badge variant="secondary">{group.orders.length} pedido(s)</Badge>
          {group.sessionClosed && (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50">
              <CheckCircle2 className="h-3 w-3" />
              Conta fechada
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">
            Total: {formatCurrency(group.combinedTotal)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </Button>

      {canSettle && (
        <div className="px-4 pb-3 -mt-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={handleSettleBill}
            disabled={isSettling}
          >
            {isSettling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4" />
            )}
            Fechar Conta
          </Button>
        </div>
      )}

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {group.orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div
                key={order._id}
                className="rounded-md border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{formatShortId(order._id)}
                    </span>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  {order.items.slice(0, MAX_VISIBLE_ITEMS).map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                  {order.items.length > MAX_VISIBLE_ITEMS && (
                    <p className="text-xs text-muted-foreground">
                      +{order.items.length - MAX_VISIBLE_ITEMS} itens
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-bold">
                    {formatCurrency(order.total)}
                  </span>
                  <OrderStatusSelect
                    currentStatus={order.status as OrderStatusType}
                    onStatusChange={(newStatus) =>
                      onStatusChange(order._id, newStatus)
                    }
                    disabled={updatingOrderId === order._id}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
