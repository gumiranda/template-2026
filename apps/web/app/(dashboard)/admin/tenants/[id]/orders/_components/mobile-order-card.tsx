"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { formatCurrency } from "@/lib/format";
import { getStatusConfig, type OrderStatusType } from "./orders-types";
import { OrderStatusSelect } from "./order-status-select";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderData {
  _id: string;
  status: OrderStatusType;
  total: number;
  createdAt: number;
  table: { tableNumber: string } | null;
  items: OrderItem[];
}

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

interface MobileOrderCardProps {
  order: OrderData;
  onStatusChange: (orderId: string, newStatus: OrderStatusType) => void;
  updatingOrderId: string | null;
}

export function MobileOrderCard({
  order,
  onStatusChange,
  updatingOrderId,
}: MobileOrderCardProps) {
  const statusConfig = getStatusConfig(order.status);

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              #{formatShortId(order._id)}
            </span>
            {order.table && (
              <span className="text-sm font-medium">
                Mesa {order.table.tableNumber}
              </span>
            )}
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        <div className="text-sm space-y-1">
          {order.items.slice(0, MAX_VISIBLE_ITEMS).map((item, i) => (
            <div key={i} className="flex justify-between text-muted-foreground">
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
          <div>
            <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusSelect
            currentStatus={order.status}
            onStatusChange={(newStatus) =>
              onStatusChange(order._id, newStatus)
            }
            disabled={updatingOrderId === order._id}
          />
        </div>
      </CardContent>
    </Card>
  );
}
