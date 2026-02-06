"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface TenantStatsMobileProps {
  totalRestaurants: number;
  totalTables: number;
  onlinePercentage: number;
  isLoading: boolean;
}

const MOBILE_STATS = [
  { label: "UNIDADES", key: "units" },
  { label: "MESAS", key: "tables" },
  { label: "ONLINE", key: "online", highlight: true },
] as const;

function getStatValue(
  key: (typeof MOBILE_STATS)[number]["key"],
  props: TenantStatsMobileProps
): string {
  const VALUE_MAP: Record<(typeof MOBILE_STATS)[number]["key"], string> = {
    units: String(props.totalRestaurants),
    tables: String(props.totalTables),
    online: `${props.onlinePercentage}%`,
  };
  return VALUE_MAP[key];
}

export function TenantStatsMobile(props: TenantStatsMobileProps) {
  if (props.isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-3 gap-4 py-4">
        {MOBILE_STATS.map((stat) => (
          <div key={stat.key} className="text-center">
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={cn(
                "text-xl font-bold",
                "highlight" in stat && stat.highlight && "text-green-500"
              )}
            >
              {getStatValue(stat.key, props)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
