import { Shield, Crown, User, Users, Utensils, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export const CLERK_PRIMARY_COLOR = "#13ec80";

export const RESTAURANT_STATUSES = [
  { id: "active", name: "Active", color: "bg-green-500", textColor: "text-green-500", icon: CheckCircle },
  { id: "maintenance", name: "Maintenance", color: "bg-yellow-500", textColor: "text-yellow-500", icon: AlertTriangle },
  { id: "inactive", name: "Inactive", color: "bg-red-500", textColor: "text-red-500", icon: XCircle },
] as const;

export function getRestaurantStatus(statusId: string | undefined) {
  return RESTAURANT_STATUSES.find((s) => s.id === statusId) ?? RESTAURANT_STATUSES[0];
}

export function getStatusBadgeConfig(statusId: string | undefined): { label: string; className: string } {
  const status = getRestaurantStatus(statusId);
  return {
    label: status.name.toUpperCase(),
    className: `${status.color} text-white`,
  };
}

export const ROLES = [
  { id: "superadmin", name: "Superadmin", icon: Shield },
  { id: "ceo", name: "CEO", icon: Crown },
  { id: "waiter", name: "Waiter", icon: Utensils },
  { id: "user", name: "User", icon: User },
] as const;

export const SECTORS = [
  { id: "general", name: "General", icon: Users },
] as const;

export function getSectorName(sector: string | undefined): string {
  if (!sector) return "-";
  const found = SECTORS.find((s) => s.id === sector);
  return found?.name ?? sector;
}
