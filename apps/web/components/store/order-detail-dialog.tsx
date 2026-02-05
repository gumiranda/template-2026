"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import { MapPin, Phone, Calendar, Package } from "lucide-react";
import { OrderStatusBadge } from "./order-status-badge";
import { formatCurrency } from "@/lib/format";

interface OrderDetailDialogProps {
  orderId: Id<"orders"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
}: OrderDetailDialogProps) {
  const order = useQuery(
    api.customerOrders.getMyOrderDetails,
    orderId ? { orderId } : "skip"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {order === undefined ? (
          <OrderDetailSkeleton />
        ) : order === null ? (
          <div className="py-8 text-center text-muted-foreground">
            Pedido não encontrado
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg">
                  Pedido #{order._id.slice(-6).toUpperCase()}
                </DialogTitle>
                <OrderStatusBadge status={order.status} />
              </div>
            </DialogHeader>

            {/* Restaurant Info */}
            {order.restaurant && (
              <div className="flex items-center gap-3 mt-2">
                {order.restaurant.logoUrl ? (
                  <Image
                    src={order.restaurant.logoUrl}
                    alt={order.restaurant.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                    {order.restaurant.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {order.restaurant.name}
                  </p>
                  {order.restaurant.address && (
                    <p className="text-xs text-muted-foreground truncate">
                      {order.restaurant.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(order.createdAt)}</span>
            </div>

            <Separator className="my-4" />

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Itens do pedido
              </h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-muted-foreground">
                        {item.quantity}x
                      </span>{" "}
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-medium ml-2">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Price Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotalPrice ?? 0)}</span>
              </div>
              {(order.totalDiscounts ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descontos</span>
                  <span>-{formatCurrency(order.totalDiscounts ?? 0)}</span>
                </div>
              )}
              {(order.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span>{formatCurrency(order.deliveryFee ?? 0)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço de entrega
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress}
                  </p>
                </div>
              </>
            )}

            {/* Restaurant Contact */}
            {order.restaurant?.phone && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.restaurant.phone}</span>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-4 w-40" />
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}
