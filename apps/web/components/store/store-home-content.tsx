"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { HeroSection } from "@/components/store/hero-section";
import { CategoryList } from "@/components/store/category-list";
import { RestaurantList } from "@/components/store/restaurant-list";
import { ProductList } from "@/components/store/product-list";
import { PromoBanner } from "@/components/store/promo-banner";

export function StoreHomeContent() {
  const categories = useQuery(api.foodCategories.listFoodCategories);
  const recommended = useQuery(api.customerRestaurants.getRecommendedRestaurants);
  const discountedProducts = useQuery(api.customerMenu.getRecommendedProducts);
  const banners = useQuery(api.promoBanners.listActiveBanners);

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
