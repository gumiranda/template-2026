"use client";

import { RestaurantCard } from "./restaurant-card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import type { Id } from "@workspace/backend/_generated/dataModel";

interface Restaurant {
  _id: Id<"restaurants">;
  name: string;
  address?: string;
  description?: string;
  logoUrl: string | null;
  coverImageUrl?: string | null;
  deliveryFee: number;
  deliveryTimeMinutes: number;
  rating: number;
}

interface RestaurantListProps {
  restaurants: Restaurant[] | undefined;
  title?: string;
}

export function RestaurantList({ restaurants, title }: RestaurantListProps) {
  if (restaurants === undefined) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <p className="text-muted-foreground">
          Nenhum restaurante encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
