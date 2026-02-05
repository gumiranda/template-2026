"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useSetAtom } from "jotai";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { isValidRestaurantId } from "@workspace/backend/lib/helpers";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowLeft, AlertCircle, ClipboardList } from "lucide-react";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { SessionOrderCard } from "./_components/session-order-card";

const SESSION_STORAGE_PREFIX = "dine-in-session-";

function getStoredSessionId(restaurantId: string, tableNumber: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${SESSION_STORAGE_PREFIX}${restaurantId}-${tableNumber}`);
}

export default function SessionOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { restaurantId } = use(params);
  const resolvedSearchParams = use(searchParams);
  const tableNumber = typeof resolvedSearchParams.table === "string" ? resolvedSearchParams.table : null;

  if (!isValidRestaurantId(restaurantId) || !tableNumber) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Link invalido</h1>
        <p className="mt-2 text-muted-foreground">
          Este link nao e valido. Volte ao menu e tente novamente.
        </p>
      </div>
    );
  }

  return (
    <SessionOrdersContent
      restaurantId={restaurantId}
      tableNumber={tableNumber}
    />
  );
}

function SessionOrdersContent({
  restaurantId,
  tableNumber,
}: {
  restaurantId: string;
  tableNumber: string;
}) {
  const setOrderContext = useSetAtom(orderContextAtom);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(getStoredSessionId(restaurantId, tableNumber));
  }, [restaurantId, tableNumber]);

  const orders = useQuery(
    api.orders.getSessionOrders,
    sessionId ? { sessionId } : "skip"
  );

  const table = useQuery(
    api.tables.getByTableNumber,
    sessionId ? { restaurantId: restaurantId as Id<"restaurants">, tableNumber } : "skip"
  );

  // Restore order context for dine-in header
  useEffect(() => {
    if (!sessionId || !table) return;

    setOrderContext({
      type: "dine_in",
      sessionId,
      tableId: table._id,
      tableNumber,
      restaurantId: restaurantId as Id<"restaurants">,
    });
  }, [sessionId, table, tableNumber, restaurantId, setOrderContext]);

  const menuHref = `/menu/${restaurantId}?table=${tableNumber}`;

  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold">Nenhuma sessao encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          Voce precisa acessar o cardapio primeiro.
        </p>
        <Button asChild className="mt-6">
          <Link href={menuHref}>Ir para o cardapio</Link>
        </Button>
      </div>
    );
  }

  if (orders === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={menuHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Meus Pedidos</h1>
          <p className="text-sm text-muted-foreground">Mesa {tableNumber}</p>
        </div>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum pedido ainda</h3>
          <p className="text-muted-foreground">
            Adicione itens do cardapio e envie seu pedido.
          </p>
          <Button asChild className="mt-6">
            <Link href={menuHref}>Voltar ao cardapio</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <SessionOrderCard key={order._id} order={order} />
          ))}

          <Button asChild variant="outline" className="w-full">
            <Link href={menuHref}>Voltar ao cardapio</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
