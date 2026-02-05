"use client";

import Image from "next/image";
import { DiscountBadge } from "../discount-badge";
import { useProductDetailsContext } from "./context";

export function ProductDetailsImage() {
  const { product } = useProductDetailsContext();

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-6xl font-bold text-muted-foreground/30">
          {product.name.charAt(0)}
        </div>
      )}
      {product.discountPercentage > 0 && (
        <div className="absolute left-4 top-4">
          <DiscountBadge percentage={product.discountPercentage} />
        </div>
      )}
    </div>
  );
}
