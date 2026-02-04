"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { RestaurantList } from "@/components/store/restaurant-list";
import { Heart } from "lucide-react";

export default function MyFavoritesPage() {
  const restaurants = useQuery(api.favorites.getUserFavoriteRestaurants);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Meus favoritos</h1>

      {restaurants !== undefined && restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Heart className="h-16 w-16 mb-4" />
          <p className="text-lg">Nenhum favorito ainda</p>
          <p className="text-sm">
            Marque restaurantes como favoritos para vê-los aqui
          </p>
        </div>
      ) : (
        <RestaurantList
          restaurants={restaurants?.map((r) => ({
            ...r,
            coverImageUrl: r.coverImageUrl ?? null,
          }))}
        />
      )}
    </div>
  );
}
