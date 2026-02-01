"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { OrderStatusBadge } from "@/components/restaurant/order-status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRestaurantSelection } from "@/hooks/use-restaurant-selection";
import { RestaurantSelectorButtons, RestaurantEmptyState } from "../components/RestaurantSelector";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  _id: Id<"orders">;
  status: string;
  table?: { tableNumber: string };
  items: OrderItem[];
  total: number;
  createdAt: number;
}

export default function OrdersPage() {
  const { selectedRestaurantId, setSelectedRestaurantId, restaurants } =
    useRestaurantSelection();
  const orders = useQuery(
    api.orders.getOrdersByRestaurant,
    selectedRestaurantId
      ? { restaurantId: selectedRestaurantId }
      : "skip"
  );

  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const handleUpdateStatus = async (
    orderId: Id<"orders">,
    newStatus: string
  ) => {
    try {
      await updateOrderStatus({
        orderId,
        status: newStatus,
      });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  const preparingOrders = orders?.filter((o) => o.status === "preparing") || [];
  const readyOrders = orders?.filter((o) => o.status === "ready") || [];

  const isLoading = selectedRestaurantId && orders === undefined;

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
          <RestaurantSelectorButtons
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantId}
            onSelect={setSelectedRestaurantId}
          />
        </div>
      </div>

      {!selectedRestaurantId && (
        <RestaurantEmptyState message="Select a restaurant to view orders" />
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
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
                  order={order as Order}
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
                  order={order as Order}
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
                  order={order as Order}
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
                  order={order as Order}
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
  order: Order;
  onUpdateStatus: (orderId: Id<"orders">, status: string) => Promise<void>;
}

function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order._id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

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
            {order.items.map((item, index) => (
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
              onClick={() => handleStatusUpdate("confirmed")}
              className="flex-1"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirm
            </Button>
          )}

          {order.status === "confirmed" && (
            <Button
              onClick={() => handleStatusUpdate("preparing")}
              className="flex-1"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start Preparing
            </Button>
          )}

          {order.status === "preparing" && (
            <Button
              onClick={() => handleStatusUpdate("ready")}
              className="flex-1"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mark Ready
            </Button>
          )}

          {order.status === "ready" && (
            <Button
              onClick={() => handleStatusUpdate("served")}
              className="flex-1"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mark Served
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
