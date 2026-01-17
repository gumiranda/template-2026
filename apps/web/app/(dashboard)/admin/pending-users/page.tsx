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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import {
  Check,
  X,
  Loader2,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const SECTORS = [
  { id: "general", name: "General", icon: Users },
];

export default function PendingUsersPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const pendingUsers = useQuery(api.users.getPendingUsers);
  const approveUser = useMutation(api.users.approveUser);
  const rejectUser = useMutation(api.users.rejectUser);

  const [approveDialog, setApproveDialog] = useState<{
    userId: Id<"users">;
    name: string;
  } | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    userId: Id<"users">;
    name: string;
  } | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>("general");
  const [rejectionReason, setRejectionReason] = useState("");
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

  const handleApprove = async () => {
    if (!approveDialog || !selectedSector) return;

    setIsLoading(true);
    try {
      await approveUser({
        userId: approveDialog.userId,
        sector: selectedSector,
      });
      toast.success(`User ${approveDialog.name} approved successfully!`);
      setApproveDialog(null);
      setSelectedSector("general");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error approving user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;

    setIsLoading(true);
    try {
      await rejectUser({
        userId: rejectDialog.userId,
        reason: rejectionReason || undefined,
      });
      toast.success(`User ${rejectDialog.name} rejected.`);
      setRejectDialog(null);
      setRejectionReason("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error rejecting user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Users</h1>
        <p className="text-muted-foreground">
          Approve or reject access requests to the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Awaiting Approval
            {pendingUsers && pendingUsers.length > 0 && (
              <Badge variant="secondary">{pendingUsers.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Users who have requested access to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users pending approval.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() =>
                          setApproveDialog({ userId: user._id, name: user.name })
                        }
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() =>
                          setRejectDialog({ userId: user._id, name: user.name })
                        }
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User</DialogTitle>
            <DialogDescription>
              Select the sector for {approveDialog?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sector</label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialog(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading || !selectedSector}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User</DialogTitle>
            <DialogDescription>
              Reject access for {rejectDialog?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
