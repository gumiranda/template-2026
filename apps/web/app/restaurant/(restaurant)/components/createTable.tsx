"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

export default function CreateTableBtn({
  selectRestaurantId,
}: {
  selectRestaurantId: Id<"restaurants"> | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Table
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
          <DialogDescription>
            Add a new table to your restaurant
          </DialogDescription>
        </DialogHeader>
        <CreateTable
          selectRestaurantId={selectRestaurantId}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreateTable({
  selectRestaurantId,
  onSuccess,
}: {
  selectRestaurantId: Id<"restaurants"> | null;
  onSuccess: () => void;
}) {
  const createTable = useMutation(api.tables.createTable);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState({
    tableNumber: "",
    capacity: 0,
    qrCode: "",
  });

  async function create() {
    if (!selectRestaurantId) {
      toast.error("Please select a restaurant first");
      return;
    }

    setIsLoading(true);
    try {
      await createTable({
        isActive: true,
        restaurantId: selectRestaurantId,
        tableNumber: tableData.tableNumber,
        capacity: Number(tableData.capacity),
        qrCode: tableData.qrCode,
      });
      toast.success("Table created successfully!");
      setTableData({ tableNumber: "", capacity: 0, qrCode: "" });
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create table"
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSetData(e: React.ChangeEvent<HTMLInputElement>) {
    setTableData({ ...tableData, [e.target.name]: e.target.value });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tableNumber">Table Number</Label>
        <Input
          id="tableNumber"
          placeholder="e.g., 1, A1, VIP-1"
          type="text"
          name="tableNumber"
          value={tableData.tableNumber}
          onChange={handleSetData}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          placeholder="Number of seats"
          type="number"
          name="capacity"
          value={tableData.capacity || ""}
          onChange={handleSetData}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="qrCode">QR Code</Label>
        <Input
          id="qrCode"
          placeholder="QR code identifier"
          type="text"
          name="qrCode"
          value={tableData.qrCode}
          onChange={handleSetData}
        />
      </div>
      <Button onClick={create} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create Table
      </Button>
    </div>
  );
}
