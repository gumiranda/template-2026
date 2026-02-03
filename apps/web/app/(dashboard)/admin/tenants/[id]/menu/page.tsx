"use client";

import { use, useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { isValidConvexId } from "@workspace/backend/lib/helpers";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
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
import { formatCurrency } from "@/lib/utils";
import { AdminGuard } from "@/components/admin-guard";
import { useUploadFile } from "@/hooks/use-upload-file";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterStatus = "all" | "in_stock" | "out_of_stock";

interface CategoryFormData {
  name: string;
  description: string;
}

interface ItemFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageFile: File | null;
}

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
  const router = useRouter();
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });

  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"menuCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Category modal state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ _id: Id<"menuCategories">; name: string; description?: string } | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: "", description: "" });

  // Item modal state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ _id: Id<"menuItems"> } | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormData>({ name: "", description: "", price: "", categoryId: "", imageFile: null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{ type: "category" | "item"; id: string; name: string } | null>(null);

  // Drag state
  const [draggedCategoryId, setDraggedCategoryId] = useState<Id<"menuCategories"> | null>(null);

  // Mutations
  const createCategory = useMutation(api.menu.createCategory);
  const updateCategory = useMutation(api.menu.updateCategory);
  const deleteCategory = useMutation(api.menu.deleteCategory);
  const reorderCategories = useMutation(api.menu.reorderCategories);
  const createItem = useMutation(api.menu.createItem);
  const updateItem = useMutation(api.menu.updateItem);
  const updateItemStatus = useMutation(api.menu.updateItemStatus);
  const deleteItem = useMutation(api.menu.deleteItem);
  const { uploadFile, isUploading } = useUploadFile();

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
  useMemo(() => {
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
    setCategoryForm({ name: "", description: "" });
    setCategoryDialogOpen(true);
  }, []);

  const handleOpenEditCategory = useCallback(
    (cat: { _id: Id<"menuCategories">; name: string; description?: string }) => {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description ?? "" });
      setCategoryDialogOpen(true);
    },
    []
  );

  const handleSaveCategory = useCallback(async () => {
    if (!categoryForm.name.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory._id,
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
        });
        toast.success("Category updated");
      } else {
        const newId = await createCategory({
          restaurantId,
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          order: sortedCategories.length,
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

  const handleOpenAddItem = useCallback(() => {
    setEditingItem(null);
    setItemForm({
      name: "",
      description: "",
      price: "",
      categoryId: selectedCategoryId ?? "",
      imageFile: null,
    });
    setImagePreview(null);
    setItemDialogOpen(true);
  }, [selectedCategoryId]);

  const handleOpenEditItem = useCallback(
    (item: { _id: Id<"menuItems">; name: string; description?: string; price: number; categoryId: Id<"menuCategories">; imageUrl?: string | null }) => {
      setEditingItem({ _id: item._id });
      setItemForm({
        name: item.name,
        description: item.description ?? "",
        price: item.price.toString(),
        categoryId: item.categoryId,
        imageFile: null,
      });
      setImagePreview(item.imageUrl ?? null);
      setItemDialogOpen(true);
    },
    []
  );

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemForm((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSaveItem = useCallback(async () => {
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) return;

    try {
      let imageId: Id<"_storage"> | undefined;
      if (itemForm.imageFile) {
        imageId = await uploadFile(itemForm.imageFile);
      }

      if (editingItem) {
        await updateItem({
          itemId: editingItem._id,
          name: itemForm.name.trim(),
          description: itemForm.description.trim() || undefined,
          price: parseFloat(itemForm.price),
          categoryId: itemForm.categoryId as Id<"menuCategories">,
          ...(imageId ? { imageId } : {}),
        });
        toast.success("Item updated");
      } else {
        await createItem({
          restaurantId,
          categoryId: itemForm.categoryId as Id<"menuCategories">,
          name: itemForm.name.trim(),
          description: itemForm.description.trim() || undefined,
          price: parseFloat(itemForm.price),
          ...(imageId ? { imageId } : {}),
        });
        toast.success("Item created");
      }
      setItemDialogOpen(false);
    } catch {
      toast.error("Failed to save item");
    }
  }, [itemForm, editingItem, uploadFile, updateItem, createItem, restaurantId]);

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/tenants/${restaurantId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Menu Builder</h1>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant menu categories and items
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ─── Sidebar ─────────────────────────────────────────────────── */}
        <div className="w-72 shrink-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <h2 className="font-semibold text-sm">Menu Categories</h2>
                <p className="text-xs text-muted-foreground">
                  Drag handles to reorder
                </p>
              </div>

              <div className="space-y-1">
                {sortedCategories.map((category) => (
                  <div
                    key={category._id}
                    draggable
                    onDragStart={() => handleDragStart(category._id)}
                    onDragOver={(e) => handleDragOver(e, category._id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedCategoryId(category._id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer group transition-colors ${
                      selectedCategoryId === category._id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
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
                      className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${
                        selectedCategoryId === category._id
                          ? "hover:bg-primary-foreground/20 text-primary-foreground"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditCategory(category);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${
                        selectedCategoryId === category._id
                          ? "hover:bg-primary-foreground/20 text-primary-foreground"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({
                          type: "category",
                          id: category._id,
                          name: category.name,
                        });
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
                onClick={handleOpenAddCategory}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ─── Main Content ────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4">
          {/* Breadcrumb */}
          <Breadcrumb>
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
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
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
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleOpenAddItem} disabled={!selectedCategoryId}>
              <Plus className="h-4 w-4 mr-1" />
              Add New Item
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-muted">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
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
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenEditItem(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
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
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Main Courses"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={!categoryForm.name.trim()}
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Item Dialog ───────────────────────────────────────────────── */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Grilled Salmon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-desc">Description</Label>
              <Textarea
                id="item-desc"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the dish"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Price</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={itemForm.price}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select
                value={itemForm.categoryId}
                onValueChange={(v) =>
                  setItemForm((prev) => ({ ...prev, categoryId: v }))
                }
              >
                <SelectTrigger id="item-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {sortedCategories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <div className="h-16 w-16 rounded-md overflow-hidden border bg-muted shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveItem}
              disabled={
                !itemForm.name.trim() ||
                !itemForm.price ||
                !itemForm.categoryId ||
                isUploading
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Uploading...
                </>
              ) : editingItem ? (
                "Save Changes"
              ) : (
                "Create Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
