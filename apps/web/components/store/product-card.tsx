"use client";

import Link from "next/link";
import { Card, CardContent } from "@workspace/ui/components/card";
import { DiscountBadge } from "./discount-badge";
import { formatCurrency } from "@/lib/format";
import type { Id } from "@workspace/backend/_generated/dataModel";

interface ProductCardProps {
  product: {
    _id: Id<"menuItems">;
    name: string;
    description?: string;
    price: number;
    discountPercentage: number;
    discountedPrice: number;
    imageUrl: string | null;
    restaurantName?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg min-w-[200px] max-w-[250px] shrink-0">
      <Link href={`/products/${product._id}`}>
        <div className="relative aspect-square bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-bold text-muted-foreground/30">
              {product.name.charAt(0)}
            </div>
          )}
          {product.discountPercentage > 0 && (
            <div className="absolute left-2 top-2">
              <DiscountBadge percentage={product.discountPercentage} />
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
          {product.restaurantName && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {product.restaurantName}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-primary">
              {formatCurrency(product.discountedPrice)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
