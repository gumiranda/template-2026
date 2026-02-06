"use client";

import { ProductCard } from "./product-card";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import type { Id } from "@workspace/backend/_generated/dataModel";

interface Product {
  _id: Id<"menuItems">;
  name: string;
  description?: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  imageUrl: string | null;
  restaurantId?: Id<"restaurants">;
  restaurantName?: string;
}

interface ProductListProps {
  products: Product[] | undefined;
  title?: string;
}

export function ProductList({ products, title }: ProductListProps) {
  if (products === undefined) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[250px] w-[200px] shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
