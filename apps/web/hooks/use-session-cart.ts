"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";

export interface SessionCartModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export function useSessionCart(sessionId: string | null) {
  const cart = useQuery(
    api.sessions.getSessionCart,
    sessionId ? { sessionId } : "skip"
  );
  const addToCartMutation = useMutation(api.sessions.addToSessionCart);
  const clearCartMutation = useMutation(api.sessions.clearSessionCart);

  const addToCart = useCallback(
    async (
      menuItemId: Id<"menuItems">,
      quantity: number,
      modifiers?: SessionCartModifier[]
    ) => {
      if (!sessionId) return;
      await addToCartMutation({ sessionId, menuItemId, quantity, modifiers });
    },
    [sessionId, addToCartMutation]
  );

  const clearCart = useCallback(async () => {
    if (!sessionId) return;
    await clearCartMutation({ sessionId });
  }, [sessionId, clearCartMutation]);

  const totalItems = useMemo(
    () => cart?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
    [cart]
  );

  return {
    items: cart ?? [],
    addToCart,
    clearCart,
    totalItems,
    isLoading: cart === undefined && sessionId !== null,
  };
}
