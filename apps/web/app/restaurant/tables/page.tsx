"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { DollarSign, Users, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { ShoppingCart } from "lucide-react";

export default function TablesPage() {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const restaurants = useQuery(api.restaurants.list);
  const tablesOverview = useQuery(
    api.tables.getTablesOverview,
    selectedRestaurantId ? { restaurantId: selectedRestaurantId as any } : "skip"
  );

  const clearCart = useMutation(api.carts.clearCart);

  const handleCloseBill = async (tableId: any) => {
    await clearCart({ tableId });
    toast.success("Bill closed successfully!");
    setIsDialogOpen(false);
    setSelectedTableId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tables</h1>
          <p className="text-muted-foreground">
            View and manage table status
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
              Select a restaurant to view tables
            </p>
          </CardContent>
        </Card>
      )}

      {selectedRestaurantId && tablesOverview && tablesOverview.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tablesOverview.map((tableOverview) => (
            <TableCard
              key={tableOverview.table._id}
              table={tableOverview.table}
              cartTotal={tableOverview.total}
              cartItems={tableOverview.cartItems}
              activeOrders={tableOverview.orders?.filter((o: any) =>
                o.status !== "served" && o.status !== "completed"
              ).length || 0}
              totalOrders={tableOverview.orders?.length || 0}
              onCloseBill={() => {
                setSelectedTableId(tableOverview.table._id);
                setIsDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : selectedRestaurantId && tablesOverview && tablesOverview.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No tables found for this restaurant
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Bill</DialogTitle>
            <DialogDescription>
              Are you sure you want to close the bill? This will clear the
              table's cart.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedTableId && handleCloseBill(selectedTableId)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Close Bill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TableCardProps {
  table: any;
  cartTotal: number;
  cartItems: any[];
  activeOrders: number;
  totalOrders: number;
  onCloseBill: () => void;
}

function TableCard({
  table,
  cartTotal,
  cartItems,
  activeOrders,
  totalOrders,
  onCloseBill,
}: TableCardProps) {
  const hasItems = cartItems && cartItems.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Table {table.tableNumber}
          </CardTitle>
          {activeOrders > 0 && (
            <Badge variant="default">{activeOrders} Active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Capacity: {table.capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Orders: {totalOrders}</span>
          </div>
        </div>

        {hasItems && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm">Current Cart</h4>
            <div className="space-y-1 text-sm">
              {cartItems.map((item: any) => (
                <div
                  key={item._id}
                  className="flex justify-between text-muted-foreground"
                >
                  <span>{item.menuItem?.name}</span>
                  <span>
                    {item.quantity} x R$ {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-lg font-bold">
            <DollarSign className="h-5 w-5" />
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
          <Button
            onClick={onCloseBill}
            variant={hasItems ? "default" : "outline"}
          >
            {hasItems ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Close Bill
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                No Items
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
