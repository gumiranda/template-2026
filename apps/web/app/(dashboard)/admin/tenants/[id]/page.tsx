"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
  Globe,
  DollarSign,
  ShoppingCart,
  UtensilsCrossed,
  LayoutGrid,
} from "lucide-react";
import { getRestaurantStatus } from "@/lib/constants";
import { AdminGuard } from "@/components/admin-guard";

export default function RestaurantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

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
  const router = useRouter();
  const restaurant = useQuery(api.restaurants.getWithStats, { id: restaurantId });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

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
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/tenants")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenants
        </Button>
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/tenants")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {restaurant.address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {restaurant.phone && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {restaurant.subdomain && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Subdomain</p>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.subdomain}.restaurantix.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(restaurant.stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {restaurant.stats.completedOrders} completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant.stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {restaurant.stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant.stats.tablesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered tables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant.stats.menuItemsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Available items
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
