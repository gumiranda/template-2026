import { Badge } from "@workspace/ui/components/badge";
import { Shield, Crown, User, Utensils } from "lucide-react";

interface RoleBadgeProps {
  role?: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "superadmin":
      return (
        <Badge variant="default">
          <Shield className="mr-1 h-3 w-3" />
          Superadmin
        </Badge>
      );
    case "ceo":
      return (
        <Badge variant="secondary">
          <Crown className="mr-1 h-3 w-3" />
          CEO
        </Badge>
      );
    case "waiter":
      return (
        <Badge variant="outline">
          <Utensils className="mr-1 h-3 w-3" />
          Waiter
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <User className="mr-1 h-3 w-3" />
          User
        </Badge>
      );
  }
}
