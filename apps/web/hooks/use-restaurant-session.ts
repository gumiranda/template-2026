"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { v4 as uuidv4 } from "uuid";

interface RestaurantSession {
  sessionId: string;
  restaurantId: string;
  tableId: string;
}

export function useRestaurantSession(restaurantId: string, tableId: string) {
  const [session, setSession] = useState<RestaurantSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createSession = useMutation(api.sessions.createSession);

  useEffect(() => {
    let sessionId = localStorage.getItem("restaurant_session_id");
    const storedRestaurantId = localStorage.getItem("restaurant_id");
    const storedTableId = localStorage.getItem("table_id");

    const isNewSession =
      !sessionId ||
      storedRestaurantId !== restaurantId ||
      storedTableId !== tableId;

    if (isNewSession) {
      sessionId = uuidv4();
      localStorage.setItem("restaurant_session_id", sessionId);
      localStorage.setItem("restaurant_id", restaurantId);
      localStorage.setItem("table_id", tableId);

      createSession({
        sessionId,
        restaurantId: restaurantId as any,
        tableId: tableId as any,
      });
    }

    setSession({
      sessionId: sessionId!,
      restaurantId,
      tableId,
    });

    setIsLoading(false);
  }, [restaurantId, tableId, createSession]);

  return { session, isLoading };
}
