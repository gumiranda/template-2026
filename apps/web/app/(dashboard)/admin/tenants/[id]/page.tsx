"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { isValidConvexId } from "@workspace/backend/lib/helpers";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Loader2,
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  DollarSign,
  ShoppingCart,
  UtensilsCrossed,
  LayoutGrid,
  LucideIcon,
} from "lucide-react";
import { getRestaurantStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { AdminGuard } from "@/components/admin-guard";
import { StatCard } from "@/components/stat-card";

function BackToTenantsButton({ variant = "ghost" }: { variant?: "ghost" | "icon" }) {
  const router = useRouter();

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/admin/tenants")}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => router.push("/admin/tenants")}
      className="mb-4"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Tenants
    </Button>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RestaurantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  if (!isValidConvexId(id)) {
    return (
      <AdminGuard>
        {() => (
          <div className="space-y-6">
            <BackToTenantsButton />
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Invalid restaurant ID</h3>
              <p className="text-muted-foreground">
                The provided ID format is not valid.
              </p>
            </div>
          </div>
        )}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      {() => <RestaurantDetailsContent restaurantId={id as Id<"restaurants">} />}
    </AdminGuard>
  );
}

function RestaurantDetailsContent({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const restaurant = useQuery(api.restaurants.getWithStats, { id: restaurantId });

  if (restaurant === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="space-y-6">
        <BackToTenantsButton />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Restaurant not found</h3>
          <p className="text-muted-foreground">
            The restaurant you are looking for does not exist or you do not have
            permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const status = getRestaurantStatus(restaurant.status);
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <BackToTenantsButton variant="icon" />
          <Avatar className="h-16 w-16">
            <AvatarImage src={restaurant.logoUrl} />
            <AvatarFallback className="bg-muted text-lg">
              {restaurant.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <Badge
                variant="outline"
                className={`${status.textColor} border-current`}
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.name}
              </Badge>
            </div>
            {restaurant.description && (
              <p className="text-muted-foreground mt-1">
                {restaurant.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard icon={MapPin} label="Address" value={restaurant.address} />
        {restaurant.phone && (
          <InfoCard icon={Phone} label="Phone" value={restaurant.phone} />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(restaurant.stats.totalRevenue)}
          subtext={`From ${restaurant.stats.completedOrders} completed orders`}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={restaurant.stats.totalOrders}
          subtext={`${restaurant.stats.pendingOrders} pending`}
          icon={ShoppingCart}
        />
        <StatCard
          title="Tables"
          value={restaurant.stats.tablesCount}
          subtext="Registered tables"
          icon={LayoutGrid}
        />
        <StatCard
          title="Menu Items"
          value={restaurant.stats.menuItemsCount}
          subtext="Available items"
          icon={UtensilsCrossed}
        />
      </div>
    </div>
  );
}
