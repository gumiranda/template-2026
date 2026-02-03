"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { DeliveryInfo } from "./delivery-info";
import { useToggleFavorite } from "@/hooks/use-toggle-favorite";
import { useUser } from "@clerk/nextjs";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { cn } from "@workspace/ui/lib/utils";

interface RestaurantCardProps {
  restaurant: {
    _id: Id<"restaurants">;
    name: string;
    address?: string;
    description?: string;
    logoUrl: string | null;
    coverImageUrl?: string | null;
    deliveryFee: number;
    deliveryTimeMinutes: number;
    rating: number;
  };
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { isSignedIn } = useUser();
  const { isFavorite, toggle } = useToggleFavorite();
  const favorited = isFavorite(restaurant._id);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/restaurants/${restaurant._id}`}>
        <div className="relative aspect-video bg-muted">
          {restaurant.coverImageUrl || restaurant.logoUrl ? (
            <Image
              src={restaurant.coverImageUrl ?? restaurant.logoUrl ?? ""}
              alt={restaurant.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-muted-foreground/30">
              {restaurant.name.charAt(0)}
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <Link
              href={`/restaurants/${restaurant._id}`}
              className="font-semibold hover:underline line-clamp-1"
            >
              {restaurant.name}
            </Link>
            {restaurant.rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
            <DeliveryInfo
              deliveryFee={restaurant.deliveryFee}
              deliveryTimeMinutes={restaurant.deliveryTimeMinutes}
            />
          </div>
          {isSignedIn && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.preventDefault();
                toggle(restaurant._id);
              }}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  favorited && "fill-red-500 text-red-500"
                )}
              />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
