"use client";

import { Loader2, Building2 } from "lucide-react";
import { MobileRestaurantCard } from "./mobile-restaurant-card";
import type { RestaurantWithStats } from "./types";

interface MobileRestaurantListProps {
  restaurants: RestaurantWithStats[] | undefined;
  filteredRestaurants: RestaurantWithStats[] | undefined;
  searchQuery: string;
  statusFilter: string;
  onEdit: (restaurant: RestaurantWithStats) => void;
  onDelete: (restaurant: RestaurantWithStats) => void;
}

export function MobileRestaurantList({
  restaurants,
  filteredRestaurants,
  searchQuery,
  statusFilter,
  onEdit,
  onDelete,
}: MobileRestaurantListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Unidades Registradas</h2>

      {restaurants === undefined ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRestaurants?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma unidade encontrada</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Tente ajustar seus filtros"
              : "Cadastre seu primeiro restaurante"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRestaurants?.map((restaurant) => (
            <MobileRestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
