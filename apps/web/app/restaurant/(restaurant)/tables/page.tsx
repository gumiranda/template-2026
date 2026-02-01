"use client";

import { useCallback, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { DollarSign, Users, CheckCircle2, ShoppingCart, Loader2 } from "lucide-react";

import { useRestaurantSelection } from "@/hooks/use-restaurant-selection";
import { RestaurantSelectorButtons, RestaurantEmptyState } from "../components/RestaurantSelector";
import { CloseBillDialog } from "../components/CloseBillDialog";
import CreateTableBtn from "../components/createTable";

export default function TablesPage() {
  const { selectedRestaurantId, setSelectedRestaurantId, restaurants } =
    useRestaurantSelection();
  const [selectedTableId, setSelectedTableId] = useState<Id<"tables"> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const tablesOverview = useQuery(
    api.tables.getTablesOverview,
    selectedRestaurantId ? { restaurantId: selectedRestaurantId } : "skip"
  );

  const handleOpenCloseBill = useCallback((tableId: Id<"tables">) => {
    setSelectedTableId(tableId);
    setIsDialogOpen(true);
  }, []);

  const isLoading = selectedRestaurantId && tablesOverview === undefined;

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
          <RestaurantSelectorButtons
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantId}
            onSelect={setSelectedRestaurantId}
          />
        </div>
      </div>

      {!selectedRestaurantId && (
        <RestaurantEmptyState message="Select a restaurant to view tables" />
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedRestaurantId && tablesOverview && tablesOverview.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tablesOverview.map((tableOverview) => {
            const activeOrders = tableOverview.orders?.filter(
              (o) => o.status !== "served" && o.status !== "completed"
            ).length ?? 0;

            return (
              <TableCard
                key={tableOverview.table._id}
                table={tableOverview.table}
                cartTotal={tableOverview.total}
                cartItems={tableOverview.cartItems}
                activeOrders={activeOrders}
                totalOrders={tableOverview.orders?.length ?? 0}
                onCloseBill={handleOpenCloseBill}
              />
            );
          })}
          <CreateTableBtn selectRestaurantId={selectedRestaurantId} />
        </div>
      )}

      {selectedRestaurantId && tablesOverview && tablesOverview.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No tables found for this restaurant
            </p>
            <CreateTableBtn selectRestaurantId={selectedRestaurantId} />
          </CardContent>
        </Card>
      )}

      <CloseBillDialog
        tableId={selectedTableId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}

interface TableCardProps {
  table: { _id: Id<"tables">; tableNumber: string; capacity: number };
  cartTotal: number;
  cartItems: Array<{ _id: string; menuItem?: { name: string } | null; quantity: number; price: number }>;
  activeOrders: number;
  totalOrders: number;
  onCloseBill: (tableId: Id<"tables">) => void;
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
              {cartItems.map((item) => (
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
            <span>R$ {(cartTotal ?? 0).toFixed(2)}</span>
          </div>
          {hasItems && (
            <Button
              onClick={() => onCloseBill(table._id)}
              variant="default"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Close Bill
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
