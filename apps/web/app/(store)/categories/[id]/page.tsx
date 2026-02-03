"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { RestaurantList } from "@/components/store/restaurant-list";
import { ProductCard } from "@/components/store/product-card";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const foodCategoryId = id as Id<"foodCategories">;

  const category = useQuery(api.foodCategories.getFoodCategoryWithProducts, {
    foodCategoryId,
  });
  const products = useQuery(api.customerMenu.getProductsByFoodCategory, {
    foodCategoryId,
  });

  if (category === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (category === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Categoria não encontrada</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4">
        {category.imageUrl && (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <h1 className="text-2xl font-bold">{category.name}</h1>
      </div>

      {category.restaurants.length > 0 && (
        <RestaurantList
          restaurants={category.restaurants.map((r) => ({
            _id: r._id,
            name: r.name,
            logoUrl: r.logoUrl,
            coverImageUrl: null,
            deliveryFee: r.deliveryFee,
            deliveryTimeMinutes: r.deliveryTimeMinutes,
            rating: r.rating,
          }))}
          title="Restaurantes"
        />
      )}

      {products && products.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Produtos</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
