"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

interface CloseBillDialogProps {
  tableId: Id<"tables"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloseBillDialog({
  tableId,
  open,
  onOpenChange,
}: CloseBillDialogProps) {
  const [isClosingBill, setIsClosingBill] = useState(false);
  const clearCart = useMutation(api.carts.clearCart);

  const handleCloseBill = async () => {
    if (!tableId) return;

    setIsClosingBill(true);
    try {
      await clearCart({ tableId });
      toast.success("Bill closed successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to close bill"
      );
    } finally {
      setIsClosingBill(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Bill</DialogTitle>
          <DialogDescription>
            Are you sure you want to close the bill? This will clear the
            table&apos;s cart.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClosingBill}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleCloseBill}
            disabled={isClosingBill}
          >
            {isClosingBill ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Confirm Close Bill
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
