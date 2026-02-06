export type OrderStatusType =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "delivering"
  | "canceled";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatusType, StatusConfig> = {
  pending: { label: "Pendente", variant: "outline" },
  confirmed: { label: "Confirmado", variant: "secondary" },
  preparing: { label: "Preparando", variant: "secondary" },
  ready: { label: "Pronto", variant: "default" },
  served: { label: "Servido", variant: "default" },
  completed: { label: "Concluido", variant: "default" },
  delivering: { label: "Entregando", variant: "secondary" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

export function getStatusConfig(status: string): StatusConfig {
  return (
    ORDER_STATUS_CONFIG[status as OrderStatusType] ?? {
      label: status,
      variant: "outline" as const,
    }
  );
}

export const VALID_STATUS_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  pending: ["confirmed", "canceled"],
  confirmed: ["preparing", "canceled"],
  preparing: ["ready", "canceled"],
  ready: ["served", "delivering", "canceled"],
  served: ["completed"],
  delivering: ["completed", "canceled"],
  completed: [],
  canceled: [],
};

export const ALL_STATUSES: OrderStatusType[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "delivering",
  "canceled",
];

export type StatusFilter = OrderStatusType | "all";

// ─── Order grouping types ────────────────────────────────────────────────────

export interface OrderItemModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  modifiers?: OrderItemModifier[];
}

export interface OrderRow {
  _id: string;
  status: string;
  total: number;
  createdAt: number;
  orderType?: string;
  sessionId?: string;
  sessionStatus?: string | null;
  table: { _id: string; tableNumber: string } | null;
  items: OrderItem[];
}

export interface TableGroup {
  key: string;
  label: string;
  tableNumber: string | null;
  sessionId: string | null;
  sessionClosed: boolean;
  orders: OrderRow[];
  combinedTotal: number;
}

const DELIVERY_KEY = "delivery";

export function groupOrdersByTable(orders: OrderRow[]): TableGroup[] {
  const groupMap = new Map<string, OrderRow[]>();

  for (const order of orders) {
    // Group by sessionId for dine-in orders, or by "delivery" for delivery orders
    const key = order.sessionId ?? (order.table?._id ? `table-${order.table._id}` : DELIVERY_KEY);
    const existing = groupMap.get(key);
    if (existing) {
      existing.push(order);
    } else {
      groupMap.set(key, [order]);
    }
  }

  const groups: TableGroup[] = [];

  for (const [key, groupOrders] of groupMap) {
    const sortedOrders = [...groupOrders].sort((a, b) => b.createdAt - a.createdAt);
    const combinedTotal = sortedOrders.reduce((sum, o) => sum + o.total, 0);
    const isDelivery = key === DELIVERY_KEY;
    const tableNumber = isDelivery ? null : sortedOrders[0]?.table?.tableNumber ?? null;
    const sessionId = sortedOrders[0]?.sessionId ?? null;
    const sessionClosed = sortedOrders[0]?.sessionStatus === "closed";

    groups.push({
      key,
      label: isDelivery ? "Delivery" : `Mesa ${tableNumber}`,
      tableNumber,
      sessionId,
      sessionClosed,
      orders: sortedOrders,
      combinedTotal,
    });
  }

  return groups.sort((a, b) => {
    // Tables first (sorted numerically), delivery last
    // Within same table, active sessions first, then closed
    if (a.tableNumber === null && b.tableNumber !== null) return 1;
    if (a.tableNumber !== null && b.tableNumber === null) return -1;
    if (a.tableNumber !== null && b.tableNumber !== null) {
      const tableCompare = Number(a.tableNumber) - Number(b.tableNumber);
      if (tableCompare !== 0) return tableCompare;
      // Same table: active sessions first
      if (a.sessionClosed !== b.sessionClosed) {
        return a.sessionClosed ? 1 : -1;
      }
    }
    return 0;
  });
}
