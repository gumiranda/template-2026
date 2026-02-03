"use client";

import Image from "next/image";
import { Card, CardContent } from "@workspace/ui/components/card";
import { OrderStatusBadge } from "./order-status-badge";
import { formatCurrency } from "@/lib/format";
import type { Id } from "@workspace/backend/_generated/dataModel";

interface OrderCardProps {
  order: {
    _id: Id<"orders">;
    status: string;
    orderType?: string;
    total: number;
    createdAt: number;
    restaurant: {
      _id: Id<"restaurants">;
      name: string;
      logoUrl: string | null;
    } | null;
    items: Array<{
      name: string;
      quantity: number;
    }>;
  };
}

const MAX_VISIBLE_ITEMS = 3;

export function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {order.restaurant?.logoUrl ? (
              <Image
                src={order.restaurant.logoUrl}
                alt={order.restaurant.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                {order.restaurant?.name.charAt(0) ?? "?"}
              </div>
            )}
            <div>
              <p className="font-semibold">
                {order.restaurant?.name ?? "Restaurante"}
              </p>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-3 space-y-1">
          {order.items.slice(0, MAX_VISIBLE_ITEMS).map((item, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {item.quantity}x {item.name}
            </p>
          ))}
          {order.items.length > MAX_VISIBLE_ITEMS && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - MAX_VISIBLE_ITEMS} itens
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-semibold">{formatCurrency(order.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
