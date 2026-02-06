import { Badge } from "@workspace/ui/components/badge";

interface DiscountBadgeProps {
  percentage: number;
}

export function DiscountBadge({ percentage }: DiscountBadgeProps) {
  if (percentage <= 0) return null;

  return (
    <Badge className="bg-green-600 text-white hover:bg-green-700">
      {percentage}% OFF
    </Badge>
  );
}
