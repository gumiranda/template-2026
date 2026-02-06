"use client";

import { useMemo, useCallback } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useCart } from "@/hooks/use-cart";
import type { CartItem as CartItemType } from "@/lib/atoms/cart";
import { formatCurrency } from "@/lib/format";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity } = useCart();

  const modifiersTotal = useMemo(
    () => item.selectedModifiers
      ? item.selectedModifiers.reduce((sum, m) => sum + m.price, 0)
      : 0,
    [item.selectedModifiers]
  );
  const unitPrice = item.discountedPrice + modifiersTotal;

  const handleDecrement = useCallback(() => {
    updateQuantity(item.menuItemId, item.quantity - 1, item.selectedModifiers);
  }, [updateQuantity, item.menuItemId, item.quantity, item.selectedModifiers]);

  const handleIncrement = useCallback(() => {
    updateQuantity(item.menuItemId, item.quantity + 1, item.selectedModifiers);
  }, [updateQuantity, item.menuItemId, item.quantity, item.selectedModifiers]);

  return (
    <div className="flex items-center gap-3">
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-md object-cover"
        />
      )}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-tight">{item.name}</p>
        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {item.selectedModifiers.map((m) => m.optionName).join(", ")}
          </p>
        )}
        <p className="text-sm text-primary font-semibold">
          {formatCurrency(unitPrice * item.quantity)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handleDecrement}
          aria-label={item.quantity === 1 ? "Remover item" : "Diminuir quantidade"}
        >
          {item.quantity === 1 ? (
            <Trash2 className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
        </Button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handleIncrement}
          aria-label="Aumentar quantidade"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
