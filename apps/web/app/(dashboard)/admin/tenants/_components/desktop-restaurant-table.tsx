"use client";

import Link from "next/link";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Loader2, Building2, Pencil, ExternalLink } from "lucide-react";
import { getRestaurantStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { RestaurantWithStats } from "./types";

interface DesktopRestaurantTableProps {
  restaurants: RestaurantWithStats[] | undefined;
  filteredRestaurants: RestaurantWithStats[] | undefined;
  searchQuery: string;
  statusFilter: string;
  onEdit: (restaurant: RestaurantWithStats) => void;
}

export function DesktopRestaurantTable({
  restaurants,
  filteredRestaurants,
  searchQuery,
  statusFilter,
  onEdit,
}: DesktopRestaurantTableProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {restaurants === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRestaurants?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No restaurants found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first restaurant to get started"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants?.map((restaurant) => {
                const status = getRestaurantStatus(restaurant.status);
                const StatusIcon = status.icon;

                return (
                  <TableRow key={restaurant._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={restaurant.logoUrl ?? undefined}
                          />
                          <AvatarFallback className="bg-muted">
                            {restaurant.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{restaurant.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${status.textColor} border-current`}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(restaurant.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(restaurant)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/tenants/${restaurant._id}`}>
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
