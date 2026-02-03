"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { useCallback, useMemo, useRef, useState } from "react";

export function useToggleFavorite() {
  const favorites = useQuery(api.favorites.getUserFavorites) ?? [];
  const toggleMutation = useMutation(api.favorites.toggleFavorite);

  // Track pending toggles for optimistic UI
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  // Clear pending toggles when the server-side list actually changes
  const prevFavoritesRef = useRef<string>("");
  const favoritesKey = favorites.join(",");
  if (prevFavoritesRef.current !== favoritesKey) {
    prevFavoritesRef.current = favoritesKey;
    if (pendingToggles.size > 0) {
      setPendingToggles(new Set());
    }
  }

  // Compute optimistic list: flip pending items
  const optimisticFavorites = useMemo(() => {
    const result: Id<"restaurants">[] = [];
    for (const id of favorites) {
      if (!pendingToggles.has(id)) {
        result.push(id);
      }
    }
    for (const id of pendingToggles) {
      if (!favorites.includes(id as Id<"restaurants">)) {
        result.push(id as Id<"restaurants">);
      }
    }
    return result;
  }, [favorites, pendingToggles]);

  const isFavorite = useCallback(
    (restaurantId: Id<"restaurants">) =>
      optimisticFavorites.includes(restaurantId),
    [optimisticFavorites]
  );

  const toggle = useCallback(
    async (restaurantId: Id<"restaurants">) => {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        if (next.has(restaurantId)) {
          next.delete(restaurantId);
        } else {
          next.add(restaurantId);
        }
        return next;
      });
      await toggleMutation({ restaurantId });
    },
    [toggleMutation]
  );

  return { isFavorite, toggle, favorites: optimisticFavorites };
}
