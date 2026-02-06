"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useToggleFavorite() {
  const favorites = useQuery(api.favorites.getUserFavorites) ?? [];
  const toggleMutation = useMutation(api.favorites.toggleFavorite);

  // Track pending toggles for optimistic UI
  const [pendingToggles, setPendingToggles] = useState<Set<Id<"restaurants">>>(new Set());

  const favoritesKey = favorites.join(",");

  useEffect(() => {
    setPendingToggles(new Set());
  }, [favoritesKey]);

  // Compute optimistic list: flip pending items
  const optimisticFavorites = useMemo(() => {
    const result: Id<"restaurants">[] = [];
    for (const id of favorites) {
      if (!pendingToggles.has(id)) {
        result.push(id);
      }
    }
    for (const id of pendingToggles) {
      if (!favorites.includes(id)) {
        result.push(id);
      }
    }
    return result;
  }, [favorites, pendingToggles]);

  const isFavorite = useCallback(
    (restaurantId: Id<"restaurants">) => optimisticFavorites.includes(restaurantId),
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
