"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useCart } from "@/hooks/use-cart";
import type { CartItem as CartItemType } from "@/lib/atoms/cart";
import { formatCurrency } from "@/lib/format";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-3">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-16 w-16 rounded-md object-cover"
        />
      )}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-tight">{item.name}</p>
        <p className="text-sm text-primary font-semibold">
          {formatCurrency(item.discountedPrice * item.quantity)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
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
          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
