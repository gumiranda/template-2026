"use client";

import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import {
  cartItemsAtom,
  cartDeliveryFeeAtom,
  type CartItem,
  type SelectedModifier,
} from "@/lib/atoms/cart";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";

function modifiersMatch(
  a?: SelectedModifier[],
  b?: SelectedModifier[]
): boolean {
  const aList = a ?? [];
  const bList = b ?? [];
  if (aList.length !== bList.length) return false;
  return aList.every(
    (mod, i) =>
      mod.groupName === bList[i]?.groupName &&
      mod.optionName === bList[i]?.optionName
  );
}

export function useCart() {
  const [items, setItems] = useAtom(cartItemsAtom);
  const [, setDeliveryFee] = useAtom(cartDeliveryFeeAtom);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
      setItems((prev) => {
        // If cart has items from a different restaurant, clear it
        const firstItem = prev[0];
        if (firstItem && firstItem.restaurantId !== item.restaurantId) {
          toast.info("Carrinho limpo", {
            description:
              "Você adicionou um item de outro restaurante. O carrinho anterior foi limpo.",
          });
          return [{ ...item, quantity }];
        }

        const existingIndex = prev.findIndex(
          (i) =>
            i.menuItemId === item.menuItemId &&
            modifiersMatch(i.selectedModifiers, item.selectedModifiers)
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          const existing = updated[existingIndex];
          if (existing) {
            updated[existingIndex] = {
              ...existing,
              quantity: existing.quantity + quantity,
            };
          }
          return updated;
        }

        return [...prev, { ...item, quantity }];
      });
    },
    [setItems]
  );

  const removeFromCart = useCallback(
    (menuItemId: Id<"menuItems">, modifiers?: SelectedModifier[]) => {
      setItems((prev) =>
        prev.filter(
          (i) =>
            !(
              i.menuItemId === menuItemId &&
              modifiersMatch(i.selectedModifiers, modifiers)
            )
        )
      );
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (
      menuItemId: Id<"menuItems">,
      quantity: number,
      modifiers?: SelectedModifier[]
    ) => {
      if (quantity <= 0) {
        removeFromCart(menuItemId, modifiers);
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.menuItemId === menuItemId &&
          modifiersMatch(i.selectedModifiers, modifiers)
            ? { ...i, quantity }
            : i
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

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

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
