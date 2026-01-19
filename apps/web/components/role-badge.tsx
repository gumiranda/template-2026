import { Badge } from "@workspace/ui/components/badge";
import { Shield, Crown, User } from "lucide-react";

interface RoleBadgeProps {
  role?: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "superadmin":
      return (
        <Badge variant="default" className="bg-purple-600">
          <Shield className="mr-1 h-3 w-3" />
          Superadmin
        </Badge>
      );
    case "ceo":
      return (
        <Badge variant="default" className="bg-amber-600">
          <Crown className="mr-1 h-3 w-3" />
          CEO
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
