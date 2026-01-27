"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Clock,
  DollarSign,
} from "lucide-react";

export default function RestaurantDashboardPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const restaurants = useQuery(api.restaurants.list);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const restaurantOrders = useQuery(
    api.orders.getOrdersByRestaurant,
    selectedRestaurantId
      ? { restaurantId: selectedRestaurantId as any }
      : "skip"
  );

  const pendingOrders = restaurantOrders?.filter((o) => o.status === "pending") || [];
  const totalOrders = restaurantOrders?.length || 0;
  const totalRevenue = restaurantOrders?.reduce((sum, order) => sum + order.total, 0) || 0;

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
          {restaurants &&
            restaurants.map((restaurant) => (
              <button
                key={restaurant._id}
                onClick={() => setSelectedRestaurantId(restaurant._id)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  selectedRestaurantId === restaurant._id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {restaurant.name}
              </button>
            ))}
        </div>
      </div>

      {!selectedRestaurantId && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a restaurant to view dashboard
            </p>
          </CardContent>
        </Card>
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
