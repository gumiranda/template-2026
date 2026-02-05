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
import { MapPin, LayoutGrid, MoreVertical, Pencil, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { getStatusBadgeConfig } from "@/lib/constants";
import type { RestaurantWithStats } from "./types";

interface MobileRestaurantCardProps {
  restaurant: RestaurantWithStats;
  onEdit: (restaurant: RestaurantWithStats) => void;
  onDelete: (restaurant: RestaurantWithStats) => void;
}

export function MobileRestaurantCard({
  restaurant,
  onEdit,
  onDelete,
}: MobileRestaurantCardProps) {
  const statusBadge = getStatusBadgeConfig(restaurant.status);

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
              <DropdownMenuItem
                onClick={() => onDelete(restaurant)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
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
