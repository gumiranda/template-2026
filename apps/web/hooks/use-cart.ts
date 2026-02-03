"use client";

import { useAtom } from "jotai";
import { useCallback } from "react";
import {
  cartItemsAtom,
  cartDeliveryFeeAtom,
  type CartItem,
} from "@/lib/atoms/cart";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";

export function useCart() {
  const [items, setItems] = useAtom(cartItemsAtom);
  const [, setDeliveryFee] = useAtom(cartDeliveryFeeAtom);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
      setItems((prev) => {
        // If cart has items from a different restaurant, clear it
        if (prev.length > 0 && prev[0]!.restaurantId !== item.restaurantId) {
          toast.info("Carrinho limpo", {
            description:
              "Você adicionou um item de outro restaurante. O carrinho anterior foi limpo.",
          });
          return [{ ...item, quantity }];
        }

        const existingIndex = prev.findIndex(
          (i) => i.menuItemId === item.menuItemId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex]!,
            quantity: updated[existingIndex]!.quantity + quantity,
          };
          return updated;
        }

        return [...prev, { ...item, quantity }];
      });
    },
    [setItems]
  );

  const removeFromCart = useCallback(
    (menuItemId: Id<"menuItems">) => {
      setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (menuItemId: Id<"menuItems">, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(menuItemId);
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        )
      );
    },
    [setItems, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setDeliveryFee(0);
  }, [setItems, setDeliveryFee]);

  const setCartDeliveryFee = useCallback(
    (fee: number) => {
      setDeliveryFee(fee);
    },
    [setDeliveryFee]
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCartDeliveryFee,
  };
}
