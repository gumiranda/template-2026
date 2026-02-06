"use client";

import { Badge } from "@workspace/ui/components/badge";
import { formatCurrency } from "@/lib/format";
import { useProductDetailsContext } from "./context";

export function ProductDetailsInfo() {
  const { product } = useProductDetailsContext();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        {product.description && (
          <p className="mt-2 text-muted-foreground">{product.description}</p>
        )}
      </div>

      {/* Dietary Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-primary">
          {formatCurrency(product.discountedPrice)}
        </span>
        {product.discountPercentage > 0 && (
          <span className="text-lg text-muted-foreground line-through">
            {formatCurrency(product.price)}
          </span>
        )}
      </div>
    </>
  );
}
