"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { RestaurantList } from "@/components/store/restaurant-list";

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const allRestaurants = useQuery(api.customerRestaurants.listPublicRestaurants);
  const searchResults = useQuery(
    api.customerRestaurants.searchPublicRestaurants,
    searchQuery ? { searchQuery } : "skip"
  );

  const restaurants = searchQuery ? searchResults : allRestaurants;

  return (
    <RestaurantList
      restaurants={restaurants}
      title={
        searchQuery
          ? `Resultados para "${searchQuery}"`
          : "Todos os restaurantes"
      }
    />
  );
}

export default function RestaurantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<RestaurantList restaurants={undefined} />}>
        <RestaurantsContent />
      </Suspense>
    </div>
  );
}
