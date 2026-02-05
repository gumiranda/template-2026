"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { HeroSection } from "@/components/store/hero-section";
import { CategoryList } from "@/components/store/category-list";
import { RestaurantList } from "@/components/store/restaurant-list";
import { ProductList } from "@/components/store/product-list";
import { PromoBanner } from "@/components/store/promo-banner";

type Categories = typeof api.foodCategories.listFoodCategories extends {
  _returnType: infer R;
}
  ? Awaited<R>
  : never;

type Restaurants = typeof api.customerRestaurants.getRecommendedRestaurants extends {
  _returnType: infer R;
}
  ? Awaited<R>
  : never;

type Products = typeof api.customerMenu.getRecommendedProducts extends {
  _returnType: infer R;
}
  ? Awaited<R>
  : never;

type Banners = typeof api.promoBanners.listActiveBanners extends {
  _returnType: infer R;
}
  ? Awaited<R>
  : never;

interface StoreHomeContentProps {
  initialCategories?: Categories | null;
  initialRecommended?: Restaurants | null;
  initialDiscountedProducts?: Products | null;
  initialBanners?: Banners | null;
}

export function StoreHomeContent({
  initialCategories,
  initialRecommended,
  initialDiscountedProducts,
  initialBanners,
}: StoreHomeContentProps) {
  const categories =
    useQuery(api.foodCategories.listFoodCategories) ??
    initialCategories ??
    undefined;
  const recommended =
    useQuery(api.customerRestaurants.getRecommendedRestaurants) ??
    initialRecommended ??
    undefined;
  const discountedProducts =
    useQuery(api.customerMenu.getRecommendedProducts) ??
    initialDiscountedProducts ??
    undefined;
  const banners =
    useQuery(api.promoBanners.listActiveBanners) ??
    initialBanners ??
    undefined;

  return (
    <div className="space-y-8">
      <HeroSection />

      <div className="container mx-auto space-y-8 px-4 pb-12">
        {banners && banners.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {banners.map((banner) => (
              <PromoBanner key={banner._id} banner={banner} />
            ))}
          </div>
        )}

        <CategoryList categories={categories} />

        {discountedProducts && discountedProducts.length > 0 && (
          <ProductList
            products={discountedProducts}
            title="Ofertas do dia"
          />
        )}

        <RestaurantList
          restaurants={recommended}
          title="Restaurantes recomendados"
        />
      </div>
    </div>
  );
}
