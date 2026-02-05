"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

export function useSessionBill(sessionId: string | null) {
  const orders = useQuery(
    api.orders.getSessionOrders,
    sessionId ? { sessionId } : "skip"
  );

  const totalBill = useMemo(
    () => orders?.reduce((sum, order) => sum + order.total, 0) ?? 0,
    [orders]
  );

  const itemCount = useMemo(
    () =>
      orders?.reduce(
        (sum, order) =>
          sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      ) ?? 0,
    [orders]
  );

  return {
    orders: orders ?? [],
    totalBill,
    itemCount,
    isLoading: orders === undefined && sessionId !== null,
  };
}
