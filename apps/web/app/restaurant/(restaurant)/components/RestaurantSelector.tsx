"use client";

import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";

interface RestaurantSelectorProps {
  restaurants:
    | Array<{ _id: Id<"restaurants">; name: string }>
    | undefined;
  selectedRestaurantId: Id<"restaurants"> | null;
  onSelect: (id: Id<"restaurants">) => void;
  emptyStateMessage?: string;
}

export function RestaurantSelectorButtons({
  restaurants,
  selectedRestaurantId,
  onSelect,
}: Omit<RestaurantSelectorProps, "emptyStateMessage">) {
  if (!restaurants) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <>
      {restaurants.map((restaurant) => (
        <Button
          key={restaurant._id}
          variant={
            selectedRestaurantId === restaurant._id ? "default" : "outline"
          }
          onClick={() => onSelect(restaurant._id)}
        >
          {restaurant.name}
        </Button>
      ))}
    </>
  );
}

export function RestaurantEmptyState({
  message = "Select a restaurant to continue",
}: {
  message?: string;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
