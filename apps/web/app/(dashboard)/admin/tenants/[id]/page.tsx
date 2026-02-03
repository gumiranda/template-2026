"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import Image from "next/image";
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
  QrCode,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { getRestaurantStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { AdminGuard } from "@/components/admin-guard";
import { StatCard } from "@/components/stat-card";

const STATUS_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "ONLINE", className: "bg-green-500 text-white" },
  maintenance: { label: "MANUTENCAO", className: "bg-yellow-500 text-white" },
  inactive: { label: "INATIVO", className: "bg-red-500 text-white" },
};

const DEFAULT_STATUS_BADGE = { label: "ONLINE", className: "bg-green-500 text-white" } as const;

function getStatusBadge(status: string | undefined): { label: string; className: string } {
  return STATUS_BADGE_CONFIG[status ?? "active"] ?? DEFAULT_STATUS_BADGE;
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

function InfoRow({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span>{value}</span>
    </div>
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
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/admin/tenants">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tenants
              </Link>
            </Button>
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
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/admin/tenants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Link>
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
  const statusBadge = getStatusBadge(restaurant.status);

  return (
    <div className="space-y-6">
      {/* ─── MOBILE LAYOUT ──────────────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {/* Back button */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/tenants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        {/* Hero cover image */}
        <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-muted">
          {restaurant.coverImageUrl ? (
            <Image
              src={restaurant.coverImageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-5xl font-bold text-primary/30">
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

        {/* Restaurant info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={restaurant.logoUrl ?? undefined} />
              <AvatarFallback className="bg-muted text-sm">
                {restaurant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <Card>
          <CardContent className="py-4 space-y-3">
            <InfoRow icon={MapPin} value={restaurant.address} />
            {restaurant.phone && (
              <InfoRow icon={Phone} value={restaurant.phone} />
            )}
          </CardContent>
        </Card>

        {/* Stats 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            label="Receita Total"
            value={formatCurrency(restaurant.stats.totalRevenue)}
            icon={DollarSign}
          />
          <MobileStatCard
            label="Pedidos"
            value={String(restaurant.stats.totalOrders)}
            subtext={`${restaurant.stats.pendingOrders} pendentes`}
            icon={ShoppingCart}
          />
          <MobileStatCard
            label="Mesas"
            value={String(restaurant.stats.tablesCount)}
            icon={LayoutGrid}
          />
          <MobileStatCard
            label="Itens do Menu"
            value={String(restaurant.stats.menuItemsCount)}
            icon={UtensilsCrossed}
          />
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" variant="outline">
            <Link href={`/admin/tenants/${restaurantId}/menu`}>
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              Gerenciar Cardapio
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href={`/admin/tenants/${restaurantId}/tables`}>
              <QrCode className="mr-2 h-4 w-4" />
              Gerenciar Mesas
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── DESKTOP LAYOUT ─────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin/tenants">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Avatar className="h-16 w-16">
              <AvatarImage src={restaurant.logoUrl ?? undefined} />
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
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/tenants/${restaurantId}/menu`}>
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Manage Menu
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/tenants/${restaurantId}/tables`}>
                <QrCode className="mr-2 h-4 w-4" />
                Manage Tables
              </Link>
            </Button>
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
    </div>
  );
}

function MobileStatCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className="text-lg font-bold">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
