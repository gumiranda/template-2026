"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { RestaurantList } from "@/components/store/restaurant-list";

export default function RecommendedRestaurantsPage() {
  const restaurants = useQuery(api.customerRestaurants.getRecommendedRestaurants);

  return (
    <div className="container mx-auto px-4 py-8">
      <RestaurantList
        restaurants={restaurants}
        title="Restaurantes recomendados"
      />
    </div>
  );
}
