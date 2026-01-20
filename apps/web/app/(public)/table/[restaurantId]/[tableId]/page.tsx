"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useRestaurantSession } from "@/hooks/use-restaurant-session";
import { MenuDisplay } from "@/components/restaurant/menu-display";
import { CartDrawer } from "@/components/restaurant/cart-drawer";
import { Loader2 } from "lucide-react";
import { RestaurantId } from "@/types/convex";

export default function TablePage() {
  const params = useParams();
  const restaurantId = params.restaurantId as RestaurantId;
  const tableId = params.tableId as string;

  const { session, isLoading: sessionLoading } = useRestaurantSession(
    restaurantId,
    tableId
  );

  const restaurant = useQuery(
    api.restaurants.getByIdentifier,
    restaurantId ? { restaurantId } : "skip"
  );
  const table = useQuery(
    api.tables.getByIdentifier,
    tableId ? { tableId } : "skip"
  );
  const menu = useQuery(
    api.menu.getMenuByRestaurant,
    restaurant ? { restaurantId } : "skip"
  );

  if (sessionLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant || !table) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            Restaurant or table not found
          </h1>
          <p className="text-muted-foreground">
            Please scan a valid QR code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">
                Table {table.tableNumber}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {menu ? (
          <MenuDisplay
            restaurantId={restaurantId}
            tableId={tableId}
            sessionId={session.sessionId}
            menu={menu}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </main>

      <CartDrawer
        restaurantId={restaurantId}
        tableId={tableId}
        sessionId={session.sessionId}
      />
    </div>
  );
}
