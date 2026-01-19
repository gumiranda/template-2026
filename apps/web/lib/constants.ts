import { Shield, Crown, User, Users } from "lucide-react";

export const ROLES = [
  { id: "superadmin", name: "Superadmin", icon: Shield },
  { id: "ceo", name: "CEO", icon: Crown },
  { id: "user", name: "User", icon: User },
] as const;

export const SECTORS = [
  { id: "general", name: "General", icon: Users },
] as const;
