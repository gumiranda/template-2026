"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { MapPin, LayoutGrid, MoreVertical, Pencil, ExternalLink } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { RestaurantWithStats } from "./types";

const DEFAULT_STATUS_BADGE = { label: "ONLINE", className: "bg-green-500 text-white" } as const;

const STATUS_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  active: DEFAULT_STATUS_BADGE,
  maintenance: { label: "MANUTENCAO", className: "bg-yellow-500 text-white" },
  inactive: { label: "INATIVO", className: "bg-red-500 text-white" },
};

function getStatusBadge(status: string | undefined): { label: string; className: string } {
  return STATUS_BADGE_CONFIG[status ?? "active"] ?? DEFAULT_STATUS_BADGE;
}

interface MobileRestaurantCardProps {
  restaurant: RestaurantWithStats;
  onEdit: (restaurant: RestaurantWithStats) => void;
}

export function MobileRestaurantCard({
  restaurant,
  onEdit,
}: MobileRestaurantCardProps) {
  const statusBadge = getStatusBadge(restaurant.status);

  return (
    <Card className="overflow-hidden">
      {/* Cover image */}
      <div className="relative aspect-[2/1] bg-muted">
        {restaurant.coverImageUrl ? (
          <Image
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl font-bold text-primary/30">
              {restaurant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Status badge overlay */}
        <Badge
          className={cn(
            "absolute top-3 right-3 border-0 text-xs font-semibold",
            statusBadge.className
          )}
        >
          {statusBadge.label}
        </Badge>
      </div>

      <CardContent className="space-y-3 p-4">
        {/* Name + dropdown */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold truncate pr-2">
            {restaurant.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(restaurant)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/tenants/${restaurant._id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Gerenciar
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{restaurant.address}</span>
        </div>

        {/* Tables count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4 shrink-0" />
          <span>
            {restaurant.tablesCount}{" "}
            {restaurant.tablesCount === 1 ? "mesa" : "mesas"}
          </span>
        </div>

        {/* Action button */}
        <Button asChild className="w-full">
          <Link href={`/admin/tenants/${restaurant._id}`}>
            Acessar Painel
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
