"use client";

import { useState, lazy, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { OrderCard } from "@/components/store/order-card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ClipboardList } from "lucide-react";

const OrderDetailDialog = lazy(() =>
  import("@/components/store/order-detail-dialog").then((m) => ({ default: m.OrderDetailDialog }))
);

export default function MyOrdersPage() {
  const orders = useQuery(api.customerOrders.getMyOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Meus pedidos</h1>

      {orders === undefined ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ClipboardList className="h-16 w-16 mb-4" />
          <p className="text-lg">Nenhum pedido ainda</p>
          <p className="text-sm">Seus pedidos aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onClick={setSelectedOrderId}
            />
          ))}
        </div>
      )}

      {selectedOrderId !== null && (
        <Suspense fallback={null}>
          <OrderDetailDialog
            orderId={selectedOrderId}
            open={true}
            onOpenChange={(open) => !open && setSelectedOrderId(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
