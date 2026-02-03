import { Badge } from "@workspace/ui/components/badge";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  preparing: { label: "Preparando", variant: "default" },
  ready: { label: "Pronto", variant: "default" },
  served: { label: "Servido", variant: "default" },
  delivering: { label: "Em entrega", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    variant: "secondary" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
