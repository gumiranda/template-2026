"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Users,
  Shield,
  Crown,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  { id: "superadmin", name: "Superadmin", icon: Shield },
  { id: "ceo", name: "CEO", icon: Crown },
  { id: "user", name: "User", icon: User },
];

const SECTORS = [
  { id: "general", name: "General", icon: Users },
];

function getRoleBadge(role?: string) {
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

function getSectorName(sector: string | undefined) {
  if (!sector) return "-";
  const found = SECTORS.find((s) => s.id === sector);
  return found?.name ?? sector;
}

export default function AdminUsersPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const users = useQuery(api.users.getAllUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const updateUserSector = useMutation(api.users.updateUserSector);

  const [editingUser, setEditingUser] = useState<{
    id: Id<"users">;
    name: string;
    role?: string;
    sector?: string;
  } | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const isSuperadmin = currentUser?.role === "superadmin";
  const isCeo = currentUser?.role === "ceo";

  if (!currentUser || (!isSuperadmin && !isCeo)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  const handleEditUser = (user: {
    _id: Id<"users">;
    name: string;
    role?: string;
    sector?: string;
  }) => {
    setEditingUser({
      id: user._id,
      name: user.name,
      role: user.role,
      sector: user.sector,
    });
    setSelectedRole(user.role ?? "");
    setSelectedSector(user.sector ?? "");
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      if (isSuperadmin && selectedRole !== editingUser.role) {
        await updateUserRole({
          userId: editingUser.id,
          role: selectedRole,
        });
      }

      if (
        selectedRole === "user" &&
        selectedSector &&
        selectedSector !== editingUser.sector
      ) {
        await updateUserSector({
          userId: editingUser.id,
          sector: selectedSector,
        });
      }

      toast.success("User updated successfully");
      setEditingUser(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error updating user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canEditUser = (userRole?: string) => {
    if (isSuperadmin) return true;
    if (isCeo && userRole === "user") return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users and their permissions in the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
          </CardTitle>
          <CardDescription>
            {isSuperadmin
              ? "As superadmin, you can change roles and sectors of any user."
              : "As CEO, you can change sectors of regular users."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getSectorName(user.sector)}</TableCell>
                  <TableCell className="text-right">
                    {canEditUser(user.role) &&
                      user._id !== currentUser._id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Change permissions for {editingUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isSuperadmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {role.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedRole === "user" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Sector</label>
                <Select
                  value={selectedSector}
                  onValueChange={setSelectedSector}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => {
                      const Icon = sector.icon;
                      return (
                        <SelectItem key={sector.id} value={sector.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {sector.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(selectedRole === "superadmin" || selectedRole === "ceo") && (
              <p className="text-sm text-muted-foreground">
                Superadmins and CEOs don't have an associated sector.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
