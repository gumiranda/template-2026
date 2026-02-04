"use client";

import { use, useMemo, useReducer, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { isValidRestaurantId } from "@workspace/backend/lib/helpers";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
  Loader2,
  ArrowLeft,
  ShoppingCart,
  Search,
} from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { toast } from "sonner";
import {
  ALL_STATUSES,
  ORDER_STATUS_CONFIG,
  type StatusFilter,
  type OrderStatusType,
} from "./_components/orders-types";
import { DesktopOrdersTable } from "./_components/desktop-orders-table";
import { MobileOrderCard } from "./_components/mobile-order-card";

// ─── State ───────────────────────────────────────────────────────────────────

interface OrdersState {
  statusFilter: StatusFilter;
  tableSearch: string;
  updatingOrderId: string | null;
}

type OrdersAction =
  | { type: "SET_STATUS_FILTER"; value: StatusFilter }
  | { type: "SET_TABLE_SEARCH"; value: string }
  | { type: "SET_UPDATING"; orderId: string | null };

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.value };
    case "SET_TABLE_SEARCH":
      return { ...state, tableSearch: action.value };
    case "SET_UPDATING":
      return { ...state, updatingOrderId: action.orderId };
  }
}

const INITIAL_STATE: OrdersState = {
  statusFilter: "all",
  tableSearch: "",
  updatingOrderId: null,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OrdersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  if (!isValidRestaurantId(id)) {
    return (
      <AdminGuard>
        {() => (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">ID de restaurante invalido</h3>
              <p className="text-muted-foreground">
                O formato do ID fornecido nao e valido.
              </p>
            </div>
          </div>
        )}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      {() => (
        <OrdersContent restaurantId={id as Id<"restaurants">} />
      )}
    </AdminGuard>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

function OrdersContent({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const [state, dispatch] = useReducer(ordersReducer, INITIAL_STATE);
  const orders = useQuery(api.orders.getOrdersByRestaurant, { restaurantId });
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders
      .filter((order) => {
        if (
          state.statusFilter !== "all" &&
          order.status !== state.statusFilter
        ) {
          return false;
        }
        if (
          state.tableSearch &&
          !order.table?.tableNumber
            ?.toLowerCase()
            .includes(state.tableSearch.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, state.statusFilter, state.tableSearch]);

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatusType) => {
      dispatch({ type: "SET_UPDATING", orderId });
      try {
        await updateStatus({
          orderId: orderId as Id<"orders">,
          status: newStatus,
        });
        toast.success("Status atualizado com sucesso");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao atualizar status"
        );
      } finally {
        dispatch({ type: "SET_UPDATING", orderId: null });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (orders === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/tenants">Restaurantes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/admin/tenants/${restaurantId}`}>Detalhes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pedidos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/tenants/${restaurantId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por mesa..."
            value={state.tableSearch}
            onChange={(e) =>
              dispatch({ type: "SET_TABLE_SEARCH", value: e.target.value })
            }
            className="pl-9"
          />
        </div>
        <Select
          value={state.statusFilter}
          onValueChange={(value) =>
            dispatch({
              type: "SET_STATUS_FILTER",
              value: value as StatusFilter,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
          <p className="text-muted-foreground">
            {orders.length === 0
              ? "Este restaurante ainda nao recebeu pedidos."
              : "Nenhum pedido corresponde aos filtros aplicados."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <DesktopOrdersTable
            orders={filteredOrders}
            onStatusChange={handleStatusChange}
            updatingOrderId={state.updatingOrderId}
          />

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order) => (
              <MobileOrderCard
                key={order._id}
                order={order}
                onStatusChange={handleStatusChange}
                updatingOrderId={state.updatingOrderId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
