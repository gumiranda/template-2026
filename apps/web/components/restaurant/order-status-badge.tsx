"use client";

import { Badge } from "@workspace/ui/components/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pending", variant: "secondary" },
    confirmed: { label: "Confirmed", variant: "outline" },
    preparing: { label: "Preparing", variant: "outline" },
    ready: { label: "Ready", variant: "default" },
    served: { label: "Served", variant: "secondary" },
    completed: { label: "Completed", variant: "secondary" },
  };

  const config = statusConfig[status] ?? statusConfig.pending!;

  return <Badge variant={config!.variant}>{config!.label}</Badge>;
}
