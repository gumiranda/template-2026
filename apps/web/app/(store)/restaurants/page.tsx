"use client";

import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { RestaurantList } from "@/components/store/restaurant-list";

export default function RestaurantsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const allRestaurants = useQuery(api.customerRestaurants.listPublicRestaurants);
  const searchResults = useQuery(
    api.customerRestaurants.searchPublicRestaurants,
    searchQuery ? { searchQuery } : "skip"
  );

  const restaurants = searchQuery ? searchResults : allRestaurants;

  return (
    <div className="container mx-auto px-4 py-8">
      <RestaurantList
        restaurants={restaurants}
        title={
          searchQuery
            ? `Resultados para "${searchQuery}"`
            : "Todos os restaurantes"
        }
      />
    </div>
  );
}
