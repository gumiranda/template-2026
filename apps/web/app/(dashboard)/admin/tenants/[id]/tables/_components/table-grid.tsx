import type { Id } from "@workspace/backend/_generated/dataModel";
import { QrCode } from "lucide-react";
import { TableCard } from "./table-card";
import type { PageAction } from "./tables-reducer";

interface TableData {
  _id: Id<"tables">;
  _creationTime: number;
  restaurantId: Id<"restaurants">;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  qrCode: string;
}

interface TableGridProps {
  tables: TableData[];
  selectedTableIds: Set<string>;
  searchQuery: string;
  statusFilter: string;
  dispatch: React.Dispatch<PageAction>;
  onToggleStatus: (tableId: Id<"tables">) => void;
  onDownloadQR: (table: TableData) => void;
}

export function TableGrid({
  tables,
  selectedTableIds,
  searchQuery,
  statusFilter,
  dispatch,
  onToggleStatus,
  onDownloadQR,
}: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No tables found</h3>
        <p className="text-muted-foreground">
          {searchQuery || statusFilter !== "all"
            ? "Try adjusting your filters"
            : "Generate your first tables to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tables.map((table) => (
        <TableCard
          key={table._id}
          table={table}
          isSelected={selectedTableIds.has(table._id)}
          onToggleSelect={() =>
            dispatch({
              type: "TOGGLE_TABLE_SELECTION",
              payload: table._id,
            })
          }
          onToggleStatus={() => onToggleStatus(table._id)}
          onDelete={() =>
            dispatch({
              type: "SET_DELETE_CONFIRM_TABLE_ID",
              payload: table._id,
            })
          }
          onDownloadQR={() => onDownloadQR(table)}
          onViewStats={() =>
            dispatch({ type: "SET_STATS_TABLE_ID", payload: table._id })
          }
        />
      ))}
    </div>
  );
}
