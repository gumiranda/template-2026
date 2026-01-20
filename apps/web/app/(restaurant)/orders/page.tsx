"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { OrderStatusBadge } from "@/components/restaurant/order-status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const restaurants = useQuery(api.restaurants.list);
  const orders = useQuery(
    api.orders.getOrdersByRestaurant,
    selectedRestaurantId
      ? { restaurantId: selectedRestaurantId as any }
      : "skip"
  );

  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const handleUpdateStatus = async (
    orderId: any,
    newStatus: string
  ) => {
    await updateOrderStatus({
      orderId,
      status: newStatus,
    });
    toast.success(`Order status updated to ${newStatus}`);
  };

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  const preparingOrders = orders?.filter((o) => o.status === "preparing") || [];
  const readyOrders = orders?.filter((o) => o.status === "ready") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage incoming orders
          </p>
        </div>
        <div className="flex gap-2">
          {restaurants &&
            restaurants.map((restaurant) => (
              <Button
                key={restaurant._id}
                variant={
                  selectedRestaurantId === restaurant._id ? "default" : "outline"
                }
                onClick={() => setSelectedRestaurantId(restaurant._id)}
              >
                {restaurant.name}
              </Button>
            ))}
        </div>
      </div>

      {!selectedRestaurantId && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a restaurant to view orders
            </p>
          </CardContent>
        </Card>
      )}

      {selectedRestaurantId && orders && (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({orders.filter((o) => o.status === "confirmed").length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready ({readyOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending orders
              </p>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {orders
              .filter((o) => o.status === "confirmed")
              .map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
          </TabsContent>

          <TabsContent value="preparing" className="space-y-4">
            {preparingOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No orders being prepared
              </p>
            ) : (
              preparingOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            {readyOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No orders ready to serve
              </p>
            ) : (
              readyOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface OrderCardProps {
  order: any;
  onUpdateStatus: (orderId: any, status: string) => Promise<void>;
}

function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Table {order.table?.tableNumber}
          </CardTitle>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Items</h4>
          <div className="space-y-2">
            {order.items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} x R$ {item.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-bold">
                  R$ {item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-lg font-bold">
            Total: R$ {order.total.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleTimeString()}
          </div>
        </div>

        <div className="flex gap-2">
          {order.status === "pending" && (
            <Button
              onClick={() => onUpdateStatus(order._id, "confirmed")}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          )}

          {order.status === "confirmed" && (
            <Button
              onClick={() => onUpdateStatus(order._id, "preparing")}
              className="flex-1"
            >
              Start Preparing
            </Button>
          )}

          {order.status === "preparing" && (
            <Button
              onClick={() => onUpdateStatus(order._id, "ready")}
              className="flex-1"
            >
              Mark Ready
            </Button>
          )}

          {order.status === "ready" && (
            <Button
              onClick={() => onUpdateStatus(order._id, "served")}
              className="flex-1"
            >
              Mark Served
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
