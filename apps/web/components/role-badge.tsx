import { Badge } from "@workspace/ui/components/badge";
import { ROLES } from "@/lib/constants";

interface RoleBadgeProps {
  role?: string;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const ROLE_VARIANTS: Record<string, BadgeVariant> = {
  superadmin: "default",
  ceo: "secondary",
  waiter: "outline",
  user: "secondary",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = ROLES.find((r) => r.id === role) ?? ROLES.find((r) => r.id === "user")!;
  const Icon = roleConfig.icon;
  const variant = ROLE_VARIANTS[role ?? "user"] ?? "secondary";

  return (
    <Badge variant={variant}>
      <Icon className="mr-1 h-3 w-3" />
      {roleConfig.name}
    </Badge>
  );
}
