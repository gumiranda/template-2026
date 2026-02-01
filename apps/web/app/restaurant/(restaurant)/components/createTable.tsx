"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CreateTableBtn({
  selectRestaurantId,
}: {
  selectRestaurantId: Id<"restaurants"> | null;
}) {
  const [showCreateTable, setShowCreateTable] = useState(false);

  return (
    <div>
      {showCreateTable ? (
        <div className="relative">
          <div className="p-2 h-16">
            <button
              onClick={() => setShowCreateTable(false)}
              className="absolute h-8 p-4 right-2"
            >
              x
            </button>
          </div>
          <CreateTable
            selectRestaurantId={selectRestaurantId}
            onSuccess={() => setShowCreateTable(false)}
          />
        </div>
      ) : (
        <div>
          <button onClick={() => setShowCreateTable(true)}>create table</button>
        </div>
      )}
    </div>
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
    <div className="space-y-2">
      <Input
        placeholder="table number"
        type="text"
        name="tableNumber"
        value={tableData.tableNumber}
        onChange={handleSetData}
      />
      <Input
        placeholder="capacity"
        type="number"
        name="capacity"
        value={tableData.capacity || ""}
        onChange={handleSetData}
      />
      <Input
        placeholder="qrCode"
        type="text"
        name="qrCode"
        value={tableData.qrCode}
        onChange={handleSetData}
      />
      <Button onClick={create} disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        create table
      </Button>
    </div>
  );
}
