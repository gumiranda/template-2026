"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";

export function useRestaurantSelection() {
  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState<Id<"restaurants"> | null>(null);

  const restaurants = useQuery(api.restaurants.list);

  return {
    selectedRestaurantId,
    setSelectedRestaurantId,
    restaurants,
  };
}
