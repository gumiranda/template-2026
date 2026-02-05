"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { formatCurrency } from "@/lib/format";
import { useProductDetailsContext } from "./context";

export function ProductDetailsAddButton() {
  const { quantity, unitPrice, requiredGroupsMissing, handleAddToCart } =
    useProductDetailsContext();

  return (
    <Button
      className="flex-1"
      size="lg"
      onClick={handleAddToCart}
      disabled={requiredGroupsMissing}
    >
      <ShoppingBag className="mr-2 h-5 w-5" />
      Adicionar {formatCurrency(unitPrice * quantity)}
    </Button>
  );
}
