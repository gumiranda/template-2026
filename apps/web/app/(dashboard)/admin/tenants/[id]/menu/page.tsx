"use client";

import { use, useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { isValidConvexId } from "@workspace/backend/lib/helpers";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Switch } from "@workspace/ui/components/switch";
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
  GripVertical,
  Pencil,
  Trash2,
  UtensilsCrossed,
  ImageIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { AdminGuard } from "@/components/admin-guard";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";
import type { FilterStatus, CategoryFormData } from "./_components/menu-types";
import { MobileCategoriesTab } from "./_components/mobile-categories-tab";
import { MobileProductsTab } from "./_components/mobile-products-tab";
import { CategoryDialog } from "./_components/category-dialog";

// ─── Page Component ──────────────────────────────────────────────────────────

export default function MenuBuilderPage({
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
        <MenuBuilderContent restaurantId={id as Id<"restaurants">} />
      )}
    </AdminGuard>
  );
}

// ─── Main Content ────────────────────────────────────────────────────────────

function MenuBuilderContent({
  restaurantId,
}: {
  restaurantId: Id<"restaurants">;
}) {
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });

  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"menuCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Category modal state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ _id: Id<"menuCategories">; name: string; description?: string; icon?: string } | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: "", description: "", icon: "" });

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState("categorias");

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{ type: "category" | "item"; id: string; name: string } | null>(null);

  // Drag state
  const [draggedCategoryId, setDraggedCategoryId] = useState<Id<"menuCategories"> | null>(null);

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
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", icon: "" });
    setCategoryDialogOpen(true);
  }, []);

  const handleOpenEditCategory = useCallback(
    (cat: { _id: Id<"menuCategories">; name: string; description?: string; icon?: string }) => {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description ?? "", icon: cat.icon ?? "" });
      setCategoryDialogOpen(true);
    },
    []
  );

  const handleSaveCategory = useCallback(async () => {
    if (!categoryForm.name.trim()) return;

    const icon = categoryForm.icon || undefined;

    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory._id,
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          icon,
        });
        toast.success("Category updated");
      } else {
        const newId = await createCategory({
          restaurantId,
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          order: sortedCategories.length,
          icon,
        });
        setSelectedCategoryId(newId);
        toast.success("Category created");
      }
      setCategoryDialogOpen(false);
    } catch {
      toast.error("Failed to save category");
    }
  }, [categoryForm, editingCategory, createCategory, updateCategory, restaurantId, sortedCategories.length]);

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
    setDeleteDialog(null);
  }, [deleteDialog, deleteCategory, selectedCategoryId]);

  const handleMobileCategorySelect = useCallback((categoryId: Id<"menuCategories">) => {
    setSelectedCategoryId(categoryId);
    setMobileTab("produtos");
  }, []);

  // ─── Drag & Drop Handlers ─────────────────────────────────────────────────

  const handleDragStart = useCallback((categoryId: Id<"menuCategories">) => {
    setDraggedCategoryId(categoryId);
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

      const orderedIds = currentOrder.map((id, index) => ({ id, order: index }));
      reorderCategories({ restaurantId, orderedIds });
    },
    [draggedCategoryId, sortedCategories, reorderCategories, restaurantId]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedCategoryId(null);
  }, []);

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
    setDeleteDialog(null);
  }, [deleteDialog, deleteItem]);

  const handleCategoryFormChange = useCallback((update: Partial<CategoryFormData>) => {
    setCategoryForm((prev) => ({ ...prev, ...update }));
  }, []);

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
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
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
            setDeleteDialog({ type: "category", id: cat._id, name: cat.name })
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
          {!selectedCategory ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No category selected</h3>
              <p className="text-muted-foreground text-sm">
                {sortedCategories.length === 0
                  ? "Create a category to get started"
                  : "Select a category from the sidebar to view items"}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No items found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filter"
                  : "Add items to this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <div className="relative aspect-[4/3] bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                      {formatCurrency(item.price)}
                    </Badge>
                    {!item.isActive && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 left-2"
                      >
                        SOLD OUT
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm truncate">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={(checked) =>
                            handleToggleItemStatus(item._id, checked)
                          }
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.isActive ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <Link
                            href={`/admin/tenants/${restaurantId}/menu/items/${item._id}/edit`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteDialog({
                              type: "item",
                              id: item._id,
                              name: item.name,
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Category Dialog ───────────────────────────────────────────── */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        isEditing={!!editingCategory}
        form={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSave={handleSaveCategory}
      />

      {/* ─── Delete Confirmation ───────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === "category"
                ? `This will permanently delete the category "${deleteDialog.name}" and all its items. This action cannot be undone.`
                : `This will permanently delete "${deleteDialog?.name}". This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={
                deleteDialog?.type === "category"
                  ? handleDeleteCategory
                  : handleDeleteItem
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Desktop Category Sidebar ─────────────────────────────────────────────────

interface DesktopCategorySidebarProps {
  categories: {
    _id: Id<"menuCategories">;
    name: string;
    description?: string;
    icon?: string;
    items: { _id: Id<"menuItems"> }[];
  }[];
  selectedCategoryId: Id<"menuCategories"> | null;
  onSelectCategory: (id: Id<"menuCategories">) => void;
  onEditCategory: (cat: { _id: Id<"menuCategories">; name: string; description?: string; icon?: string }) => void;
  onDeleteCategory: (cat: { _id: Id<"menuCategories">; name: string }) => void;
  onAddCategory: () => void;
  onDragStart: (id: Id<"menuCategories">) => void;
  onDragOver: (e: React.DragEvent, targetId: Id<"menuCategories">) => void;
  onDragEnd: () => void;
}

function DesktopCategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DesktopCategorySidebarProps) {
  return (
    <div className="hidden lg:block w-72 shrink-0">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <h2 className="font-semibold text-sm">Menu Categories</h2>
            <p className="text-xs text-muted-foreground">
              Drag handles to reorder
            </p>
          </div>

          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category._id}
                draggable
                onDragStart={() => onDragStart(category._id)}
                onDragOver={(e) => onDragOver(e, category._id)}
                onDragEnd={onDragEnd}
                onClick={() => onSelectCategory(category._id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer group transition-colors",
                  selectedCategoryId === category._id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 opacity-40 cursor-grab" />
                <span className="text-sm font-medium truncate flex-1">
                  {category.name}
                </span>
                <Badge
                  variant={selectedCategoryId === category._id ? "secondary" : "outline"}
                  className="text-xs h-5 px-1.5"
                >
                  {category.items.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 opacity-0 group-hover:opacity-100",
                    selectedCategoryId === category._id &&
                      "hover:bg-primary-foreground/20 text-primary-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 opacity-0 group-hover:opacity-100",
                    selectedCategoryId === category._id &&
                      "hover:bg-primary-foreground/20 text-primary-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={onAddCategory}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
