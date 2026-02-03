import { Clock, Bike } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { formatCurrency } from "@/lib/format";

interface DeliveryInfoProps {
  deliveryFee: number;
  deliveryTimeMinutes: number;
}

export function DeliveryInfo({
  deliveryFee,
  deliveryTimeMinutes,
}: DeliveryInfoProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1 text-xs">
        <Bike className="h-3 w-3" />
        {deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}
      </Badge>
      <Badge variant="secondary" className="gap-1 text-xs">
        <Clock className="h-3 w-3" />
        {deliveryTimeMinutes} min
      </Badge>
    </div>
  );
}
