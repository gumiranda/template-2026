"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  ShoppingCart,
  Utensils,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";

import { useRestaurantSelection } from "@/hooks/use-restaurant-selection";
import { RestaurantSelectorButtons, RestaurantEmptyState } from "./components/RestaurantSelector";

export default function RestaurantDashboardPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const { selectedRestaurantId, setSelectedRestaurantId, restaurants } =
    useRestaurantSelection();

  const restaurantOrders = useQuery(
    api.orders.getOrdersByRestaurant,
    selectedRestaurantId
      ? { restaurantId: selectedRestaurantId }
      : "skip"
  );

  const pendingOrders = restaurantOrders?.filter((o) => o.status === "pending") || [];
  const totalOrders = restaurantOrders?.length || 0;
  const totalRevenue = restaurantOrders?.reduce((sum, order) => sum + order.total, 0) || 0;

  const isLoading = selectedRestaurantId && restaurantOrders === undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome{currentUser?.name ? `, ${currentUser.name}` : ""}!
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
        <RestaurantEmptyState message="Select a restaurant to view dashboard" />
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedRestaurantId && restaurantOrders && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Restaurants
              </CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurants?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View all orders in Orders page
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
