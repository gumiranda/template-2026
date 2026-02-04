"use client";

import { use, useState, useReducer, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { isValidRestaurantId } from "@workspace/backend/lib/helpers";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { toast } from "sonner";
import type { FilterStatus, CategoryFormData } from "./_components/menu-types";
import { menuDialogReducer, menuDialogInitialState } from "./_components/menu-reducer";
import { MobileCategoriesTab } from "./_components/mobile-categories-tab";
import { MobileProductsTab } from "./_components/mobile-products-tab";
import { CategoryDialog } from "./_components/category-dialog";
import { MenuItemsGrid } from "./_components/menu-items-grid";
import { DesktopCategorySidebar } from "./_components/desktop-category-sidebar";

// ─── Page Component ──────────────────────────────────────────────────────────

export default function MenuBuilderPage({
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
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
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
      {() => (
        <MenuBuilderContent restaurantId={id} />
      )}
    </AdminGuard>
  );
}

// ─── Delete Dialog Handlers ────────────────────────────────────────────────────

type MobileTab = "categorias" | "produtos";

const DELETE_DESCRIPTIONS: Record<"category" | "item", (name: string) => string> = {
  category: (name) =>
    `This will permanently delete the category "${name}" and all its items. This action cannot be undone.`,
  item: (name) =>
    `This will permanently delete "${name}". This action cannot be undone.`,
};

// ─── Main Content ────────────────────────────────────────────────────────────

function MenuBuilderContent({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });

  // Independent state
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"menuCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [mobileTab, setMobileTab] = useState<MobileTab>("categorias");

  // Coupled dialog/drag state via reducer
  const [dialogState, dispatchDialog] = useReducer(menuDialogReducer, menuDialogInitialState);
  const { categoryDialog, deleteDialog, draggedCategoryId } = dialogState;

  const pendingReorderRef = useRef<{ id: Id<"menuCategories">; order: number }[] | null>(null);

  // Mutations
  const createCategory = useMutation(api.menu.createCategory);
  const updateCategory = useMutation(api.menu.updateCategory);
  const deleteCategory = useMutation(api.menu.deleteCategory);
  const reorderCategories = useMutation(api.menu.reorderCategories);
  const updateItemStatus = useMutation(api.menu.updateItemStatus);
  const deleteItem = useMutation(api.menu.deleteItem);

  // Derived state
  const sortedCategories = useMemo(() => {
    if (!menu) return [];
    return [...menu].sort((a, b) => a.order - b.order);
  }, [menu]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId || !sortedCategories.length) return null;
    return sortedCategories.find((c) => c._id === selectedCategoryId) ?? null;
  }, [selectedCategoryId, sortedCategories]);

  // Auto-select first category
  useEffect(() => {
    const first = sortedCategories[0];
    if (first && !selectedCategoryId) {
      setSelectedCategoryId(first._id);
    }
  }, [sortedCategories, selectedCategoryId]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    let items = selectedCategory.items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    if (filterStatus === "in_stock") {
      items = items.filter((item) => item.isActive);
    } else if (filterStatus === "out_of_stock") {
      items = items.filter((item) => !item.isActive);
    }

    return items;
  }, [selectedCategory, searchQuery, filterStatus]);

  // ─── Category Handlers ──────────────────────────────────────────────────────

  const handleOpenAddCategory = useCallback(() => {
    dispatchDialog({ type: "OPEN_ADD_CATEGORY" });
  }, []);

  const handleOpenEditCategory = useCallback(
    (cat: { _id: Id<"menuCategories">; name: string; description?: string; icon?: string }) => {
      dispatchDialog({ type: "OPEN_EDIT_CATEGORY", payload: cat });
    },
    []
  );

  const handleSaveCategory = useCallback(async () => {
    if (!categoryDialog.form.name.trim()) return;

    const icon = categoryDialog.form.icon || undefined;

    try {
      if (categoryDialog.editing) {
        await updateCategory({
          categoryId: categoryDialog.editing._id,
          name: categoryDialog.form.name.trim(),
          description: categoryDialog.form.description.trim() || undefined,
          icon,
        });
        toast.success("Category updated");
      } else {
        const newId = await createCategory({
          restaurantId,
          name: categoryDialog.form.name.trim(),
          description: categoryDialog.form.description.trim() || undefined,
          order: sortedCategories.length,
          icon,
        });
        setSelectedCategoryId(newId);
        toast.success("Category created");
      }
      dispatchDialog({ type: "CLOSE_CATEGORY_DIALOG" });
    } catch {
      toast.error("Failed to save category");
    }
  }, [categoryDialog, createCategory, updateCategory, restaurantId, sortedCategories.length]);

  const handleDeleteCategory = useCallback(async () => {
    if (!deleteDialog || deleteDialog.type !== "category") return;
    try {
      await deleteCategory({ categoryId: deleteDialog.id as Id<"menuCategories"> });
      if (selectedCategoryId === deleteDialog.id) {
        setSelectedCategoryId(null);
      }
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
    dispatchDialog({ type: "CLOSE_DELETE_DIALOG" });
  }, [deleteDialog, deleteCategory, selectedCategoryId]);

  const handleMobileCategorySelect = useCallback((categoryId: Id<"menuCategories">) => {
    setSelectedCategoryId(categoryId);
    setMobileTab("produtos");
  }, []);

  // ─── Drag & Drop Handlers ─────────────────────────────────────────────────

  const handleDragStart = useCallback((categoryId: Id<"menuCategories">) => {
    dispatchDialog({ type: "SET_DRAGGED_CATEGORY", payload: categoryId });
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetId: Id<"menuCategories">) => {
      e.preventDefault();
      if (!draggedCategoryId || draggedCategoryId === targetId) return;

      const currentOrder = sortedCategories.map((c) => c._id);
      const draggedIndex = currentOrder.indexOf(draggedCategoryId);
      const targetIndex = currentOrder.indexOf(targetId);
      if (draggedIndex === -1 || targetIndex === -1) return;

      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedCategoryId);

      pendingReorderRef.current = currentOrder.map((id, index) => ({ id, order: index }));
    },
    [draggedCategoryId, sortedCategories]
  );

  const handleDragEnd = useCallback(() => {
    if (pendingReorderRef.current) {
      reorderCategories({ restaurantId, orderedIds: pendingReorderRef.current });
      pendingReorderRef.current = null;
    }
    dispatchDialog({ type: "CLEAR_DRAGGED_CATEGORY" });
  }, [reorderCategories, restaurantId]);

  // ─── Item Handlers ──────────────────────────────────────────────────────────

  const handleToggleItemStatus = useCallback(
    async (itemId: Id<"menuItems">, isActive: boolean) => {
      try {
        await updateItemStatus({ itemId, isActive });
      } catch {
        toast.error("Failed to update item status");
      }
    },
    [updateItemStatus]
  );

  const handleDeleteItem = useCallback(async () => {
    if (!deleteDialog || deleteDialog.type !== "item") return;
    try {
      await deleteItem({ itemId: deleteDialog.id as Id<"menuItems"> });
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
    dispatchDialog({ type: "CLOSE_DELETE_DIALOG" });
  }, [deleteDialog, deleteItem]);

  const handleCategoryFormChange = useCallback((update: Partial<CategoryFormData>) => {
    dispatchDialog({ type: "SET_CATEGORY_FORM", payload: update });
  }, []);

  const deleteHandlers: Record<"category" | "item", () => void> = useMemo(
    () => ({ category: handleDeleteCategory, item: handleDeleteItem }),
    [handleDeleteCategory, handleDeleteItem]
  );

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (menu === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/tenants/${restaurantId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Menu Builder</h1>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant menu categories and items
          </p>
        </div>
      </div>

      {/* ─── Mobile Layout with Tabs ─────────────────────────────── */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as MobileTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="categorias" className="flex-1">Categorias</TabsTrigger>
            <TabsTrigger value="produtos" className="flex-1">Produtos</TabsTrigger>
          </TabsList>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <TabsContent value="categorias" className="space-y-4">
            <MobileCategoriesTab
              categories={sortedCategories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleMobileCategorySelect}
              onEditCategory={handleOpenEditCategory}
              onAddCategory={handleOpenAddCategory}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />
          </TabsContent>

          <TabsContent value="produtos" className="space-y-3">
            <MobileProductsTab
              selectedCategory={selectedCategory}
              filteredItems={filteredItems}
              restaurantId={restaurantId}
              onToggleItemStatus={handleToggleItemStatus}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex gap-6">
        {/* ─── Sidebar (desktop only) ──────────────────────────────────── */}
        <DesktopCategorySidebar
          categories={sortedCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={(cat) =>
            dispatchDialog({ type: "OPEN_DELETE_DIALOG", payload: { type: "category", id: cat._id, name: cat.name } })
          }
          onAddCategory={handleOpenAddCategory}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />

        {/* ─── Main Content ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Breadcrumb (desktop only) */}
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/tenants/${restaurantId}`}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/tenants/${restaurantId}/menu`}>
                  Menu Builder
                </BreadcrumbLink>
              </BreadcrumbItem>
              {selectedCategory && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedCategory.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as FilterStatus)}
            >
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild disabled={!selectedCategoryId}>
              <Link href={`/admin/tenants/${restaurantId}/menu/items/new`}>
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add New Item</span>
              </Link>
            </Button>
          </div>

          {/* Items Grid */}
          <MenuItemsGrid
            items={filteredItems}
            restaurantId={restaurantId}
            hasCategory={!!selectedCategory}
            hasCategories={sortedCategories.length > 0}
            hasFilters={!!searchQuery || filterStatus !== "all"}
            onToggleItemStatus={handleToggleItemStatus}
            onDeleteItem={(item) =>
              dispatchDialog({ type: "OPEN_DELETE_DIALOG", payload: { type: "item", id: item._id, name: item.name } })
            }
          />
        </div>
      </div>

      {/* ─── Category Dialog ───────────────────────────────────────────── */}
      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(open) => !open && dispatchDialog({ type: "CLOSE_CATEGORY_DIALOG" })}
        isEditing={!!categoryDialog.editing}
        form={categoryDialog.form}
        onFormChange={handleCategoryFormChange}
        onSave={handleSaveCategory}
      />

      {/* ─── Delete Confirmation ───────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && dispatchDialog({ type: "CLOSE_DELETE_DIALOG" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog
                ? DELETE_DESCRIPTIONS[deleteDialog.type](deleteDialog.name)
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteHandlers[deleteDialog?.type ?? "item"]}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
