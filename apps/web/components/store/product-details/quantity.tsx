"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useProductDetailsContext } from "./context";

export function ProductDetailsQuantity() {
  const { quantity, setQuantity } = useProductDetailsContext();

  return (
    <div className="flex items-center gap-2 rounded-lg border p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setQuantity(quantity + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
