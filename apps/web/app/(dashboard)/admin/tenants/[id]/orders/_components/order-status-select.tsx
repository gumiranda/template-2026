"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  VALID_STATUS_TRANSITIONS,
  ORDER_STATUS_CONFIG,
  type OrderStatusType,
} from "./orders-types";

interface OrderStatusSelectProps {
  currentStatus: OrderStatusType;
  onStatusChange: (newStatus: OrderStatusType) => void;
  disabled?: boolean;
}

export function OrderStatusSelect({
  currentStatus,
  onStatusChange,
  disabled,
}: OrderStatusSelectProps) {
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

  if (validTransitions.length === 0) {
    return null;
  }

  return (
    <Select
      value=""
      onValueChange={(value) => onStatusChange(value as OrderStatusType)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Alterar status" />
      </SelectTrigger>
      <SelectContent>
        {validTransitions.map((status) => {
          const config = ORDER_STATUS_CONFIG[status];
          return (
            <SelectItem key={status} value={status}>
              {config.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
