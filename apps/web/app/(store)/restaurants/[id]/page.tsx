"use client";

import { use } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { isValidRestaurantId } from "@workspace/backend/lib/helpers";
import { Star } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { DeliveryInfo } from "@/components/store/delivery-info";
import { ProductCard } from "@/components/store/product-card";
import { useToggleFavorite } from "@/hooks/use-toggle-favorite";
import { useUser } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  if (!isValidRestaurantId(id)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Restaurante não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          O ID fornecido não é válido.
        </p>
      </div>
    );
  }

  return <RestaurantDetail restaurantId={id} />;
}

function RestaurantDetail({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const restaurant = useQuery(api.customerRestaurants.getPublicRestaurant, {
    restaurantId,
  });
  const { isSignedIn } = useUser();
  const { isFavorite, toggle } = useToggleFavorite();

  if (restaurant === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
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
      {/* Cover Image */}
      <div className="relative h-48 bg-muted md:h-64">
        {restaurant.coverImageUrl ? (
          <Image
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : restaurant.logoUrl ? (
          <Image
            src={restaurant.logoUrl}
            alt={restaurant.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : null}
      </div>

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
        {restaurant.categories.length > 0 ? (
          <Tabs defaultValue={restaurant.categories[0]?._id}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {restaurant.categories.map((category) => (
                <TabsTrigger key={category._id} value={category._id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {restaurant.categories.map((category) => (
              <TabsContent key={category._id} value={category._id}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {category.items.map((item) => (
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
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum item no cardápio ainda.
          </p>
        )}
      </div>
    </div>
  );
}
