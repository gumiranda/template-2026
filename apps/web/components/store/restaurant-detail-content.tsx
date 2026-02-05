"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Star, Heart } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { DeliveryInfo } from "@/components/store/delivery-info";
import { ProductCard } from "@/components/store/product-card";
import { RestaurantCoverImage } from "@/components/store/restaurant-cover-image";
import { RestaurantLoadingSkeleton } from "@/components/store/restaurant-loading-skeleton";
import { MenuCategoryTabs } from "@/components/store/menu-category-tabs";
import { useToggleFavorite } from "@/hooks/use-toggle-favorite";
import { useUser } from "@clerk/nextjs";

interface RestaurantDetailContentProps {
  restaurantId: Id<"restaurants">;
}

export function RestaurantDetailContent({
  restaurantId,
}: RestaurantDetailContentProps) {
  const restaurant = useQuery(api.customerRestaurants.getPublicRestaurant, {
    restaurantId,
  });
  const { isSignedIn } = useUser();
  const { isFavorite, toggle } = useToggleFavorite();

  if (restaurant === undefined) {
    return <RestaurantLoadingSkeleton />;
  }

  if (restaurant === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Restaurante não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este restaurante pode ter sido removido ou não está disponível.
        </p>
      </div>
    );
  }

  const favorited = isFavorite(restaurant._id);

  return (
    <div>
      <RestaurantCoverImage
        name={restaurant.name}
        coverImageUrl={restaurant.coverImageUrl}
        logoUrl={restaurant.logoUrl}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Restaurant Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="text-muted-foreground">{restaurant.description}</p>
            )}
            <div className="flex items-center gap-4">
              {restaurant.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {restaurant.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <DeliveryInfo
                deliveryFee={restaurant.deliveryFee}
                deliveryTimeMinutes={restaurant.deliveryTimeMinutes}
              />
            </div>
          </div>
          {isSignedIn && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggle(restaurant._id)}
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

        <Separator />

        {/* Menu Categories */}
        <MenuCategoryTabs
          categories={restaurant.categories}
          renderItem={(item) => (
            <ProductCard
              key={item._id}
              product={{
                _id: item._id,
                name: item.name,
                description: item.description,
                price: item.price,
                discountPercentage: item.discountPercentage ?? 0,
                discountedPrice: item.discountedPrice,
                imageUrl: item.imageUrl,
              }}
            />
          )}
          emptyMessage="Nenhum item no cardápio ainda."
        />
      </div>
    </div>
  );
}
