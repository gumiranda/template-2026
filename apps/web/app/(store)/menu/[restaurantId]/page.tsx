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
import { Button } from "@workspace/ui/components/button";
import { Plus, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useSessionCart } from "@/hooks/use-session-cart";
import { formatCurrency } from "@/lib/format";
import { SessionErrorScreen } from "@/components/store/session-error-screen";
import { RestaurantCoverImage } from "@/components/store/restaurant-cover-image";
import { RestaurantLoadingSkeleton } from "@/components/store/restaurant-loading-skeleton";
import { MenuCategoryTabs, type MenuTabItem } from "@/components/store/menu-category-tabs";

const SESSION_STORAGE_PREFIX = "dine-in-session-";
const DEVICE_ID_KEY = "dine-in-device-id";
const MAX_TABLE_NUMBER_LENGTH = 50;
const TABLE_NUMBER_REGEX = /^[A-Za-z0-9-]+$/;
const MAX_SESSION_CREATE_RETRIES = 3;

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
  const rawTableNumber = typeof resolvedSearchParams.table === "string" ? resolvedSearchParams.table : null;
  const tableNumber = rawTableNumber &&
    rawTableNumber.length <= MAX_TABLE_NUMBER_LENGTH &&
    TABLE_NUMBER_REGEX.test(rawTableNumber)
      ? rawTableNumber
      : null;

  if (!isValidRestaurantId(restaurantId) || !tableNumber) {
    return (
      <SessionErrorScreen
        title="Link invalido"
        description="Este QR code nao e valido. Tente escanear novamente."
        variant="info"
      />
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
  const [sessionError, setSessionError] = useState(false);
  const sessionCreateAttempted = useRef(false);
  const retryCount = useRef(0);

  const restaurant = useQuery(api.customerRestaurants.getPublicRestaurant, {
    restaurantId,
  });
  const table = useQuery(api.tables.getByTableNumber, {
    restaurantId,
    tableNumber,
  });
  const createSession = useMutation(api.sessions.createSession);

  const { addToCart } = useSessionCart(sessionReady ? sessionId : null);

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

        // Session was closed or other error — retry with new session (with limit)
        if (retryCount.current >= MAX_SESSION_CREATE_RETRIES) {
          setSessionError(true);
          return;
        }
        retryCount.current += 1;
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
    return <RestaurantLoadingSkeleton />;
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
      <SessionErrorScreen
        title="Mesa nao encontrada"
        description={`A mesa ${tableNumber} nao existe ou esta inativa.`}
        variant="info"
      />
    );
  }

  if (tableOccupied) {
    return (
      <SessionErrorScreen
        title="Mesa Ocupada"
        description="Esta mesa ja possui um cliente ativo."
        secondaryDescription="Aguarde o garcom fechar a conta anterior."
        variant="warning"
      />
    );
  }

  if (alreadyAtAnotherTable) {
    return (
      <SessionErrorScreen
        title="Voce ja esta em outra mesa"
        description="Feche sua conta na mesa atual antes de acessar outra."
        variant="warning"
      />
    );
  }

  if (sessionError) {
    return (
      <SessionErrorScreen
        title="Erro ao iniciar sessao"
        description="Nao foi possivel conectar a mesa. Tente novamente mais tarde."
        variant="error"
        actionLabel="Tentar novamente"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!sessionReady) {
    return <RestaurantLoadingSkeleton />;
  }

  return (
    <div>
      <RestaurantCoverImage
        name={restaurant.name}
        coverImageUrl={restaurant.coverImageUrl}
        logoUrl={restaurant.logoUrl}
      />

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
        <MenuCategoryTabs
          categories={restaurant.categories}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(item) => (
            <DineInProductCard
              key={item._id}
              item={item}
              onAdd={handleAddToCart}
            />
          )}
          emptyMessage="Nenhum item no cardapio ainda."
        />
      </div>
    </div>
  );
}

interface DineInProductCardProps {
  item: MenuTabItem;
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
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-lg font-bold text-muted-foreground/30"
            aria-label={item.name}
          >
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
        aria-label={`Adicionar ${item.name} ao pedido`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
