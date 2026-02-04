"use client";

import { use, useReducer, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { isValidConvexId } from "@workspace/backend/lib/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import {
  Loader2,
  Building2,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  BarChart3,
  MoreVertical,
  QrCode,
  Trash2,
  Power,
  Diamond,
  ArrowUpDown,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { AdminGuard } from "@/components/admin-guard";
import { StatCard } from "@/components/stat-card";

type FormatTemplate = "tent-card-4x6" | "sticker-2x2";
type ColorTheme = "light" | "dark";
type StatusFilter = "all" | "active" | "inactive";
type SortBy = "number" | "created" | "status";
type SortOrder = "asc" | "desc";

interface BatchSettings {
  formatTemplate: FormatTemplate;
  colorTheme: ColorTheme;
  callToAction: string;
  showTableNumber: boolean;
}

interface PageState {
  searchQuery: string;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedTableIds: Set<string>;
  generateForm: { startId: string; endId: string };
  batchSettings: BatchSettings;
  isGenerating: boolean;
  deleteConfirmTableId: string | null;
  statsTableId: string | null;
}

type PageAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: StatusFilter }
  | { type: "SET_SORT_BY"; payload: SortBy }
  | { type: "SET_SORT_ORDER"; payload: SortOrder }
  | { type: "TOGGLE_SORT_ORDER" }
  | { type: "TOGGLE_TABLE_SELECTION"; payload: string }
  | { type: "SELECT_ALL_TABLES"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_GENERATE_FORM"; payload: { startId?: string; endId?: string } }
  | { type: "SET_BATCH_SETTING"; payload: Partial<BatchSettings> }
  | { type: "SET_IS_GENERATING"; payload: boolean }
  | { type: "SET_DELETE_CONFIRM_TABLE_ID"; payload: string | null }
  | { type: "SET_STATS_TABLE_ID"; payload: string | null };

const initialBatchSettings: BatchSettings = {
  formatTemplate: "tent-card-4x6",
  colorTheme: "light",
  callToAction: "SCAN TO ORDER",
  showTableNumber: true,
};

const initialState: PageState = {
  searchQuery: "",
  statusFilter: "all",
  sortBy: "number",
  sortOrder: "asc",
  selectedTableIds: new Set(),
  generateForm: { startId: "", endId: "" },
  batchSettings: initialBatchSettings,
  isGenerating: false,
  deleteConfirmTableId: null,
  statsTableId: null,
};

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload };
    case "SET_SORT_ORDER":
      return { ...state, sortOrder: action.payload };
    case "TOGGLE_SORT_ORDER":
      return { ...state, sortOrder: state.sortOrder === "asc" ? "desc" : "asc" };
    case "TOGGLE_TABLE_SELECTION": {
      const newSet = new Set(state.selectedTableIds);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      return { ...state, selectedTableIds: newSet };
    }
    case "SELECT_ALL_TABLES":
      return { ...state, selectedTableIds: new Set(action.payload) };
    case "CLEAR_SELECTION":
      return { ...state, selectedTableIds: new Set() };
    case "SET_GENERATE_FORM":
      return {
        ...state,
        generateForm: { ...state.generateForm, ...action.payload },
      };
    case "SET_BATCH_SETTING":
      return {
        ...state,
        batchSettings: { ...state.batchSettings, ...action.payload },
      };
    case "SET_IS_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "SET_DELETE_CONFIRM_TABLE_ID":
      return { ...state, deleteConfirmTableId: action.payload };
    case "SET_STATS_TABLE_ID":
      return { ...state, statsTableId: action.payload };
    default:
      return state;
  }
}

function BackToRestaurantButton({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.push(`/admin/tenants/${restaurantId}`)}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}

export default function TableManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  if (!isValidConvexId(id)) {
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
      {() => <TableManagementContent restaurantId={id as Id<"restaurants">} />}
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
      if (!svg) return;

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

      // Background
      pdf.setFillColor(bgColor);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.setTextColor(textColor);

      const qrImageData = qrImages[index];

      if (batchSettings.formatTemplate === "tent-card-4x6") {
        const qrSize = 2;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = 0.6;

        // Add QR code image
        if (qrImageData) {
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
        }

        // Call to action text
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(batchSettings.callToAction, pageWidth / 2, qrY + qrSize + 0.35, { align: "center" });

        // Table number
        if (batchSettings.showTableNumber) {
          pdf.setFontSize(32);
          const tableText = `TABLE ${table.tableNumber}`;
          pdf.text(tableText, pageWidth / 2, pageHeight - 0.35, { align: "center" });
        }
      } else {
        const qrSize = 1.1;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = 0.35;

        // Call to action text
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(batchSettings.callToAction, pageWidth / 2, 0.22, { align: "center" });

        // Add QR code image
        if (qrImageData) {
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
        }

        // Table number
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
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <BackToRestaurantButton restaurantId={restaurantId} />
        <div>
          <h1 className="text-2xl font-bold">TABLE MANAGEMENT</h1>
          <p className="text-muted-foreground">
            Manage floor plans and generate QR codes for {restaurant.name}
          </p>
        </div>
      </div>

      <div className="flex gap-6">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Generate Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-id">START ID</Label>
                  <Input
                    id="start-id"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={generateForm.startId}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_GENERATE_FORM",
                        payload: { startId: e.target.value },
                      })
                    }
                    className="w-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-id">END ID</Label>
                  <Input
                    id="end-id"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={generateForm.endId}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_GENERATE_FORM",
                        payload: { endId: e.target.value },
                      })
                    }
                    className="w-24"
                  />
                </div>
                <Button
                  onClick={handleGenerateTables}
                  disabled={isGenerating || !generateForm.startId || !generateForm.endId}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum 50 tables per batch. Existing table numbers will be skipped.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search tables..."
                      value={searchQuery}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_SEARCH_QUERY",
                          payload: e.target.value,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      dispatch({
                        type: "SET_STATUS_FILTER",
                        payload: value as StatusFilter,
                      })
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortBy}
                    onValueChange={(value) =>
                      dispatch({ type: "SET_SORT_BY", payload: value as SortBy })
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => dispatch({ type: "TOGGLE_SORT_ORDER" })}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {filteredAndSortedTables.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedTableIds.size === filteredAndSortedTables.length &&
                      filteredAndSortedTables.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm text-muted-foreground">
                    Select all ({selectedTableIds.size} of {filteredAndSortedTables.length})
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {filteredAndSortedTables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tables found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Generate your first tables to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedTables.map((table) => (
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
                  onToggleStatus={() => handleToggleStatus(table._id)}
                  onDelete={() =>
                    dispatch({
                      type: "SET_DELETE_CONFIRM_TABLE_ID",
                      payload: table._id,
                    })
                  }
                  onDownloadQR={() => handleDownloadQR(table)}
                  onViewStats={() =>
                    dispatch({ type: "SET_STATS_TABLE_ID", payload: table._id })
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-80 shrink-0">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Batch Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2 text-center">
                    Live Preview
                  </p>
                  <div
                    className={`aspect-[3/2] rounded-md flex flex-col items-center justify-center p-4 ${
                      batchSettings.colorTheme === "dark"
                        ? "bg-zinc-900 text-white"
                        : "bg-white text-black border"
                    }`}
                  >
                    <p className="text-xs font-bold mb-2">
                      {batchSettings.callToAction}
                    </p>
                    <QRCodeSVG
                      value="https://example.com/menu/preview?table=1"
                      size={80}
                      bgColor={batchSettings.colorTheme === "dark" ? "#18181b" : "#ffffff"}
                      fgColor={batchSettings.colorTheme === "dark" ? "#ffffff" : "#000000"}
                    />
                    {batchSettings.showTableNumber && (
                      <p className="text-lg font-bold mt-2">TABLE 1</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Format Template</Label>
                  <Select
                    value={batchSettings.formatTemplate}
                    onValueChange={(value) =>
                      dispatch({
                        type: "SET_BATCH_SETTING",
                        payload: { formatTemplate: value as FormatTemplate },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tent-card-4x6">Tent Card (4x6)</SelectItem>
                      <SelectItem value="sticker-2x2">Sticker (2x2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <ToggleGroup
                    type="single"
                    value={batchSettings.colorTheme}
                    onValueChange={(value) =>
                      value &&
                      dispatch({
                        type: "SET_BATCH_SETTING",
                        payload: { colorTheme: value as ColorTheme },
                      })
                    }
                    className="w-full"
                  >
                    <ToggleGroupItem value="light" className="flex-1">
                      <Sun className="h-4 w-4 mr-1" />
                      Light
                    </ToggleGroupItem>
                    <ToggleGroupItem value="dark" className="flex-1">
                      <Moon className="h-4 w-4 mr-1" />
                      Dark
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="call-to-action">Call to Action</Label>
                  <Input
                    id="call-to-action"
                    value={batchSettings.callToAction}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_BATCH_SETTING",
                        payload: { callToAction: e.target.value },
                      })
                    }
                    placeholder="SCAN TO ORDER"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-table-number"
                      checked={batchSettings.showTableNumber}
                      onCheckedChange={(checked) =>
                        dispatch({
                          type: "SET_BATCH_SETTING",
                          payload: { showTableNumber: checked === true },
                        })
                      }
                    />
                    <Label htmlFor="show-table-number">Show Table Number</Label>
                  </div>
                </div>

                <Button className="w-full" onClick={handlePrintAll}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print {selectedTableIds.size > 0 ? `Selected (${selectedTableIds.size})` : "All"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
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

interface TableCardProps {
  table: {
    _id: Id<"tables">;
    tableNumber: string;
    capacity: number;
    isActive: boolean;
    qrCode: string;
  };
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onDownloadQR: () => void;
  onViewStats: () => void;
}

function TableCard({
  table,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onDelete,
  onDownloadQR,
  onViewStats,
}: TableCardProps) {
  return (
    <Card className={isSelected ? "ring-2 ring-primary" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
            <span className="font-bold text-lg">#{table.tableNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={table.isActive ? "default" : "secondary"}>
              {table.isActive ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewStats}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Stats
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadQR}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleStatus}>
                  <Power className="mr-2 h-4 w-4" />
                  {table.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex justify-center p-2 bg-white rounded-md">
          <QRCodeSVG
            id={`qr-${table._id}`}
            value={table.qrCode}
            size={100}
            level="M"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Capacity: {table.capacity}
        </p>
      </CardContent>
    </Card>
  );
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tableNumber: string;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tableNumber,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Table #{tableNumber}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the table
            and its QR code.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TableStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: Id<"tables"> | null;
}

function TableStatsDialog({ open, onOpenChange, tableId }: TableStatsDialogProps) {
  const analytics = useQuery(
    api.tables.getTableAnalytics,
    tableId ? { tableId } : "skip"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Table Statistics
            {analytics?.table && (
              <Badge variant="outline" className="ml-2">
                #{analytics.table.tableNumber}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {analytics === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : analytics === null ? (
          <p className="text-center text-muted-foreground py-8">
            Failed to load analytics
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analytics.avgOrderValue)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-medium mb-2">Orders by Status</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                  <Badge key={status} variant="outline">
                    {status}: {count}
                  </Badge>
                ))}
                {Object.keys(analytics.ordersByStatus).length === 0 && (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recent Orders</h4>
              {analytics.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analytics.recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            order.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="text-sm">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
