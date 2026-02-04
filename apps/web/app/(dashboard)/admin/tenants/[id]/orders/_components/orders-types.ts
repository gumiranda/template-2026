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
