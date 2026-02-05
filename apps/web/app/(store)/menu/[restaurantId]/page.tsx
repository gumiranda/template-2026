"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { useSetAtom } from "jotai";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { isValidRestaurantId } from "@workspace/backend/lib/helpers";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import { Plus, AlertCircle, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useSessionCart } from "@/hooks/use-session-cart";
import { formatCurrency } from "@/lib/format";

const SESSION_STORAGE_PREFIX = "dine-in-session-";
const DEVICE_ID_KEY = "dine-in-device-id";

function getStoredSessionId(restaurantId: string, tableNumber: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${SESSION_STORAGE_PREFIX}${restaurantId}-${tableNumber}`);
}

function storeSessionId(restaurantId: string, tableNumber: string, sessionId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${SESSION_STORAGE_PREFIX}${restaurantId}-${tableNumber}`, sessionId);
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export default function DineInMenuPage({
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
          Este QR code nao e valido. Tente escanear novamente.
        </p>
      </div>
    );
  }

  return (
    <DineInContent
      restaurantId={restaurantId}
      tableNumber={tableNumber}
    />
  );
}

function DineInContent({
  restaurantId,
  tableNumber,
}: {
  restaurantId: Id<"restaurants">;
  tableNumber: string;
}) {
  const setOrderContext = useSetAtom(orderContextAtom);
  const [sessionId, setSessionId] = useState(
    () => getStoredSessionId(restaurantId, tableNumber) ?? uuidv4()
  );
  const [sessionReady, setSessionReady] = useState(false);
  const [tableOccupied, setTableOccupied] = useState(false);
  const [alreadyAtAnotherTable, setAlreadyAtAnotherTable] = useState(false);
  const sessionCreateAttempted = useRef(false);

  const restaurant = useQuery(api.customerRestaurants.getPublicRestaurant, {
    restaurantId,
  });
  const table = useQuery(api.tables.getByTableNumber, {
    restaurantId,
    tableNumber,
  });
  const createSession = useMutation(api.sessions.createSession);

  const { addToCart } = useSessionCart(sessionReady ? sessionId : null);

  // Create session and set order context once table is loaded
  useEffect(() => {
    if (!table || sessionReady || sessionCreateAttempted.current) return;
    sessionCreateAttempted.current = true;

    createSession({
      sessionId,
      restaurantId,
      tableId: table._id,
      deviceId: getDeviceId(),
    })
      .then((result) => {
        // Use the sessionId returned by backend (may be from existing active session)
        const activeSessionId = result.sessionId;
        storeSessionId(restaurantId, tableNumber, activeSessionId);
        setSessionId(activeSessionId);
        setSessionReady(true);
        setOrderContext({
          type: "dine_in",
          sessionId: activeSessionId,
          tableId: table._id,
          tableNumber,
          restaurantId,
        });
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : "";

        // Table is occupied by another customer
        if (errorMessage.includes("TABLE_OCCUPIED")) {
          setTableOccupied(true);
          return;
        }

        // Device already has an active session at another table
        if (errorMessage.includes("ALREADY_AT_ANOTHER_TABLE")) {
          setAlreadyAtAnotherTable(true);
          return;
        }

        // Session was closed — create a new one
        if (errorMessage.includes("SESSION_CLOSED")) {
          const newId = uuidv4();
          storeSessionId(restaurantId, tableNumber, newId);
          sessionCreateAttempted.current = false;
          setSessionId(newId);
          return;
        }

        // Other errors — retry with new session
        const newId = uuidv4();
        storeSessionId(restaurantId, tableNumber, newId);
        sessionCreateAttempted.current = false;
        setSessionId(newId);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, sessionId]);

  const handleAddToCart = useCallback(
    async (menuItemId: Id<"menuItems">, itemName: string) => {
      try {
        await addToCart(menuItemId, 1);
        toast.success(`${itemName} adicionado ao pedido`);
      } catch {
        toast.error("Erro ao adicionar item. Tente novamente.");
      }
    },
    [addToCart]
  );

  if (restaurant === undefined || table === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Restaurante nao encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este restaurante pode ter sido removido ou nao esta disponivel.
        </p>
      </div>
    );
  }

  if (table === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Mesa nao encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          A mesa {tableNumber} nao existe ou esta inativa.
        </p>
      </div>
    );
  }

  if (tableOccupied) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold">Mesa Ocupada</h1>
        <p className="mt-2 text-muted-foreground">
          Esta mesa ja possui um cliente ativo.
        </p>
        <p className="mt-1 text-muted-foreground">
          Aguarde o garcom fechar a conta anterior.
        </p>
      </div>
    );
  }

  if (alreadyAtAnotherTable) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold">Voce ja esta em outra mesa</h1>
        <p className="mt-2 text-muted-foreground">
          Feche sua conta na mesa atual antes de acessar outra.
        </p>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div>
      {/* Cover Image */}
      <div className="relative h-48 bg-muted md:h-64">
        {restaurant.coverImageUrl ? (
          <Image
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : restaurant.logoUrl ? (
          <Image
            src={restaurant.logoUrl}
            alt={restaurant.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : null}
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Restaurant + Table Info */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-muted-foreground">{restaurant.description}</p>
          )}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Mesa {tableNumber}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/menu/${restaurantId}/orders?table=${tableNumber}`}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Meus Pedidos
              </Link>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Menu Categories */}
        {restaurant.categories.length > 0 ? (
          <Tabs defaultValue={restaurant.categories[0]?._id}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {restaurant.categories.map((category) => (
                <TabsTrigger key={category._id} value={category._id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {restaurant.categories.map((category) => (
              <TabsContent key={category._id} value={category._id}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item) => (
                    <DineInProductCard
                      key={item._id}
                      item={item}
                      onAdd={handleAddToCart}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum item no cardapio ainda.
          </p>
        )}
      </div>
    </div>
  );
}

interface DineInProductCardProps {
  item: {
    _id: Id<"menuItems">;
    name: string;
    description?: string;
    price: number;
    discountPercentage?: number;
    discountedPrice: number;
    imageUrl: string | null;
  };
  onAdd: (menuItemId: Id<"menuItems">, name: string) => void;
}

function DineInProductCard({ item, onAdd }: DineInProductCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-lg font-bold text-muted-foreground/30">
            {item.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-sm text-primary">
            {formatCurrency(item.discountedPrice)}
          </span>
          {(item.discountPercentage ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(item.price)}
            </span>
          )}
        </div>
      </div>

      <Button
        size="icon"
        variant="outline"
        className="shrink-0"
        onClick={() => onAdd(item._id, item.name)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
