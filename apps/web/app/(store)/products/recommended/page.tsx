"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { ProductCard } from "@/components/store/product-card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function RecommendedProductsPage() {
  const products = useQuery(api.customerMenu.getRecommendedProducts);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Produtos com desconto</h1>

      {products === undefined ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum produto com desconto no momento.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
