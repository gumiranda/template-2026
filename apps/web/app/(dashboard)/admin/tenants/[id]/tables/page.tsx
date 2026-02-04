"use client";

import { use, useReducer, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { isValidRestaurantId } from "@workspace/backend/lib/helpers";
import { Button } from "@workspace/ui/components/button";
import {
  Loader2,
  Building2,
  ArrowLeft,
  QrCode,
  Power,
  Diamond,
} from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin-guard";
import { StatCard } from "@/components/stat-card";
import { pageReducer, initialState } from "./_components/tables-reducer";
import { DeleteConfirmDialog } from "./_components/delete-confirm-dialog";
import { TableStatsDialog } from "./_components/table-stats-dialog";
import { BatchActionsDesktop, BatchActionsMobile } from "./_components/batch-actions-panel";
import { GenerateTablesForm } from "./_components/generate-tables-form";
import { TableSearchToolbar } from "./_components/table-search-toolbar";
import { TableGrid } from "./_components/table-grid";

function BackToRestaurantButton({ restaurantId }: { restaurantId: string }) {
  return (
    <Button asChild variant="ghost" size="icon">
      <Link href={`/admin/tenants/${restaurantId}`}>
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Button>
  );
}

export default function TableManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  if (!isValidRestaurantId(id)) {
    return (
      <AdminGuard>
        {() => (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Invalid restaurant ID</h3>
              <p className="text-muted-foreground">
                The provided ID format is not valid.
              </p>
            </div>
          </div>
        )}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      {() => <TableManagementContent restaurantId={id} />}
    </AdminGuard>
  );
}

function TableManagementContent({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const [state, dispatch] = useReducer(pageReducer, initialState);
  const {
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    selectedTableIds,
    generateForm,
    batchSettings,
    isGenerating,
    deleteConfirmTableId,
    statsTableId,
  } = state;

  const restaurant = useQuery(api.restaurants.getWithStats, { id: restaurantId });
  const tables = useQuery(api.tables.listTablesWithQR, { restaurantId });
  const stats = useQuery(api.tables.getTableStats, { restaurantId });

  const batchCreateTables = useMutation(api.tables.batchCreateTables);
  const toggleTableStatus = useMutation(api.tables.toggleTableStatus);
  const deleteTable = useMutation(api.tables.deleteTable);

  const filteredAndSortedTables = useMemo(() => {
    if (!tables) return [];

    const result = tables.filter((table) => {
      const matchesSearch = table.tableNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && table.isActive) ||
        (statusFilter === "inactive" && !table.isActive);

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "number":
          comparison = parseInt(a.tableNumber, 10) - parseInt(b.tableNumber, 10);
          break;
        case "created":
          comparison = a._creationTime - b._creationTime;
          break;
        case "status":
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tables, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleGenerateTables = useCallback(async () => {
    const start = parseInt(generateForm.startId, 10);
    const end = parseInt(generateForm.endId, 10);

    if (isNaN(start) || isNaN(end)) {
      toast.error("Please enter valid numbers for Start and End ID");
      return;
    }
    if (start < 1) {
      toast.error("Start ID must be at least 1");
      return;
    }
    if (end < start) {
      toast.error("End ID must be greater than or equal to Start ID");
      return;
    }
    if (end - start + 1 > 50) {
      toast.error("Cannot create more than 50 tables at once");
      return;
    }

    dispatch({ type: "SET_IS_GENERATING", payload: true });
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const result = await batchCreateTables({
        restaurantId,
        startId: start,
        endId: end,
        baseUrl,
      });

      if (result.created > 0) {
        toast.success(`Created ${result.created} tables`);
      }
      if (result.skipped.length > 0) {
        toast.info(`Skipped existing tables: ${result.skipped.join(", ")}`);
      }
      dispatch({ type: "SET_GENERATE_FORM", payload: { startId: "", endId: "" } });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create tables"
      );
    } finally {
      dispatch({ type: "SET_IS_GENERATING", payload: false });
    }
  }, [generateForm, restaurantId, batchCreateTables]);

  const handleToggleStatus = useCallback(
    async (tableId: Id<"tables">) => {
      try {
        const result = await toggleTableStatus({ tableId });
        toast.success(`Table ${result.isActive ? "activated" : "deactivated"}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to toggle status"
        );
      }
    },
    [toggleTableStatus]
  );

  const handleDeleteTable = useCallback(async () => {
    if (!deleteConfirmTableId) return;

    try {
      await deleteTable({ tableId: deleteConfirmTableId as Id<"tables"> });
      toast.success("Table deleted successfully");
      dispatch({ type: "SET_DELETE_CONFIRM_TABLE_ID", payload: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete table"
      );
    }
  }, [deleteConfirmTableId, deleteTable]);

  const handleDownloadQR = useCallback(
    (table: NonNullable<typeof tables>[number]) => {
      const svg = document.getElementById(`qr-${table._id}`);
      if (!svg) {
        toast.error("Falha ao carregar QR code. Atualize a página.");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.download = `table-${table.tableNumber}-qr.png`;
        link.href = pngUrl;
        link.click();
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    },
    []
  );

  const handlePrintAll = useCallback(async () => {
    const tablesToPrint =
      selectedTableIds.size > 0
        ? filteredAndSortedTables.filter((t) => selectedTableIds.has(t._id))
        : filteredAndSortedTables;

    if (tablesToPrint.length === 0) {
      toast.error("No tables to print");
      return;
    }

    toast.info("Generating PDF...");

    const isDark = batchSettings.colorTheme === "dark";
    const bgColor = isDark ? "#1a1a1a" : "#ffffff";
    const textColor = isDark ? "#ffffff" : "#000000";
    const qrBgColor = "#ffffff";

    const { jsPDF } = await import("jspdf");

    const qrImages = await Promise.all(
      tablesToPrint.map((table) => {
        return new Promise<string>((resolve) => {
          const svg = document.getElementById(`qr-hidden-${table._id}`);
          if (!svg) {
            resolve("");
            return;
          }

          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();

          img.onload = () => {
            canvas.width = 400;
            canvas.height = 400;
            if (ctx) {
              ctx.fillStyle = qrBgColor;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            resolve(canvas.toDataURL("image/png"));
          };

          img.onerror = () => resolve("");
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        });
      })
    );

    const pdf = new jsPDF({
      orientation: batchSettings.formatTemplate === "tent-card-4x6" ? "landscape" : "portrait",
      unit: "in",
      format:
        batchSettings.formatTemplate === "tent-card-4x6" ? [6, 4] : [2, 2],
    });

    tablesToPrint.forEach((table, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(bgColor);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setTextColor(textColor);

      const qrImageData = qrImages[index];

      if (batchSettings.formatTemplate === "tent-card-4x6") {
        const qrSize = 2;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = 0.6;

        if (qrImageData) {
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
        }

        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(batchSettings.callToAction, pageWidth / 2, qrY + qrSize + 0.35, { align: "center" });

        if (batchSettings.showTableNumber) {
          pdf.setFontSize(32);
          const tableText = `TABLE ${table.tableNumber}`;
          pdf.text(tableText, pageWidth / 2, pageHeight - 0.35, { align: "center" });
        }
      } else {
        const qrSize = 1.1;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = 0.35;

        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(batchSettings.callToAction, pageWidth / 2, 0.22, { align: "center" });

        if (qrImageData) {
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
        }

        if (batchSettings.showTableNumber) {
          pdf.setFontSize(10);
          const tableText = `#${table.tableNumber}`;
          pdf.text(tableText, pageWidth / 2, pageHeight - 0.12, { align: "center" });
        }
      }
    });

    pdf.save(`tables-qr-${Date.now()}.pdf`);
    toast.success(`Generated PDF with ${tablesToPrint.length} tables`);
  }, [selectedTableIds, filteredAndSortedTables, batchSettings]);

  const handleSelectAll = useCallback(() => {
    if (selectedTableIds.size === filteredAndSortedTables.length) {
      dispatch({ type: "CLEAR_SELECTION" });
    } else {
      dispatch({
        type: "SELECT_ALL_TABLES",
        payload: filteredAndSortedTables.map((t) => t._id),
      });
    }
  }, [selectedTableIds.size, filteredAndSortedTables]);

  if (restaurant === undefined || tables === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Restaurant not found</h3>
          <p className="text-muted-foreground">
            The restaurant you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center gap-3">
        <BackToRestaurantButton restaurantId={restaurantId} />
        <div className="min-w-0">
          <h1 className="text-lg font-bold truncate">Mesas - {restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">
            QR codes e gerenciamento
          </p>
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden lg:flex items-start gap-4">
        <BackToRestaurantButton restaurantId={restaurantId} />
        <div>
          <h1 className="text-2xl font-bold">TABLE MANAGEMENT</h1>
          <p className="text-muted-foreground">
            Manage floor plans and generate QR codes for {restaurant.name}
          </p>
        </div>
      </div>

      <div className="lg:flex lg:gap-6">
        <div className="flex-1 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Tables"
              value={stats?.totalTables ?? 0}
              subtext="Registered tables"
              icon={Diamond}
              isLoading={stats === undefined}
            />
            <StatCard
              title="Active Tables"
              value={stats?.activeTables ?? 0}
              subtext="Ready for service"
              icon={QrCode}
              isLoading={stats === undefined}
            />
            <StatCard
              title="Inactive Tables"
              value={stats?.inactiveTables ?? 0}
              subtext="Currently disabled"
              icon={Power}
              isLoading={stats === undefined}
            />
          </div>

          <GenerateTablesForm
            generateForm={generateForm}
            isGenerating={isGenerating}
            dispatch={dispatch}
            onGenerate={handleGenerateTables}
          />

          <TableSearchToolbar
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            sortBy={sortBy}
            selectedCount={selectedTableIds.size}
            totalCount={filteredAndSortedTables.length}
            dispatch={dispatch}
            onSelectAll={handleSelectAll}
          />

          <TableGrid
            tables={filteredAndSortedTables}
            selectedTableIds={selectedTableIds}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            dispatch={dispatch}
            onToggleStatus={handleToggleStatus}
            onDownloadQR={handleDownloadQR}
          />
        </div>

        <BatchActionsDesktop
          batchSettings={batchSettings}
          selectedCount={selectedTableIds.size}
          dispatch={dispatch}
          onPrint={handlePrintAll}
        />
      </div>

      <BatchActionsMobile
        batchSettings={batchSettings}
        selectedCount={selectedTableIds.size}
        dispatch={dispatch}
        onPrint={handlePrintAll}
      />

      {/* Hidden QR codes for PDF generation */}
      <div className="absolute -left-[9999px] -top-[9999px]">
        {tables.map((table) => (
          <QRCodeSVG
            key={`hidden-${table._id}`}
            id={`qr-hidden-${table._id}`}
            value={table.qrCode}
            size={400}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        ))}
      </div>

      <DeleteConfirmDialog
        open={deleteConfirmTableId !== null}
        onOpenChange={(open) =>
          !open && dispatch({ type: "SET_DELETE_CONFIRM_TABLE_ID", payload: null })
        }
        onConfirm={handleDeleteTable}
        tableNumber={
          tables.find((t) => t._id === deleteConfirmTableId)?.tableNumber ?? ""
        }
      />

      <TableStatsDialog
        open={statsTableId !== null}
        onOpenChange={(open) =>
          !open && dispatch({ type: "SET_STATS_TABLE_ID", payload: null })
        }
        tableId={statsTableId as Id<"tables"> | null}
      />
    </div>
  );
}
