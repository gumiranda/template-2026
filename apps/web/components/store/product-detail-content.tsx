"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import { ProductDetails } from "@/components/store/product-details/index";
import { ProductList } from "@/components/store/product-list";

interface ProductDetailContentProps {
  menuItemId: Id<"menuItems">;
}

export function ProductDetailContent({ menuItemId }: ProductDetailContentProps) {
  const product = useQuery(api.customerMenu.getProductDetails, { menuItemId });

  if (product === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este produto pode ter sido removido ou não está disponível.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ProductDetails product={product} />

      {product.relatedProducts.length > 0 && (
        <>
          <Separator />
          <ProductList
            products={product.relatedProducts}
            title="Produtos relacionados"
          />
        </>
      )}
    </div>
  );
}
