import { Shield, Crown, User, Users, Utensils } from "lucide-react";

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
