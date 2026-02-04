"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";
import type { FoodCategoryFormData } from "./food-category-types";

interface FoodCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: FoodCategoryFormData;
  existingImageUrl?: string | null;
  editingId?: string;
  onSubmit: (
    data: FoodCategoryFormData,
    imageId: Id<"_storage"> | undefined
  ) => Promise<string>;
  uploadFile: (file: File) => Promise<Id<"_storage">>;
  isUploading: boolean;
}

export function FoodCategoryDialog({
  open,
  onOpenChange,
  initialData,
  existingImageUrl,
  editingId,
  onSubmit,
  uploadFile,
  isUploading,
}: FoodCategoryDialogProps) {
  const [form, setForm] = useState<FoodCategoryFormData>(initialData);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Restaurant linking ────────────────────────────────────────────────────

  const restaurants = useQuery(api.restaurants.listAllWithStats);
  const linkedRestaurants = useQuery(
    api.foodCategories.getLinkedRestaurants,
    editingId
      ? { foodCategoryId: editingId as Id<"foodCategories"> }
      : "skip"
  );
  const linkMutation = useMutation(
    api.foodCategories.linkRestaurantToCategory
  );
  const unlinkMutation = useMutation(
    api.foodCategories.unlinkRestaurantFromCategory
  );

  // For create mode: track selected restaurants locally
  const [createModeSelection, setCreateModeSelection] = useState<Set<string>>(
    new Set()
  );
  const [pendingLinks, setPendingLinks] = useState<Set<string>>(new Set());

  const uniqueRestaurants = useMemo(() => {
    if (!restaurants) return [];
    const seen = new Set<string>();
    return restaurants.filter((r) => {
      if (seen.has(r._id)) return false;
      seen.add(r._id);
      return true;
    });
  }, [restaurants]);

  const linkedIds = useMemo(() => {
    if (!linkedRestaurants) return new Set<string>();
    return new Set(linkedRestaurants.map((r) => r._id as string));
  }, [linkedRestaurants]);

  // Edit mode: toggle inline
  const handleToggleEdit = useCallback(
    async (restaurantId: string, isLinked: boolean) => {
      if (!editingId) return;
      setPendingLinks((prev) => new Set(prev).add(restaurantId));
      try {
        if (isLinked) {
          await unlinkMutation({
            restaurantId: restaurantId as Id<"restaurants">,
            foodCategoryId: editingId as Id<"foodCategories">,
          });
        } else {
          await linkMutation({
            restaurantId: restaurantId as Id<"restaurants">,
            foodCategoryId: editingId as Id<"foodCategories">,
          });
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao atualizar vinculo"
        );
      } finally {
        setPendingLinks((prev) => {
          const next = new Set(prev);
          next.delete(restaurantId);
          return next;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingId]
  );

  // Create mode: toggle local selection
  const handleToggleCreate = useCallback(
    (restaurantId: string) => {
      setCreateModeSelection((prev) => {
        const next = new Set(prev);
        if (next.has(restaurantId)) {
          next.delete(restaurantId);
        } else {
          next.add(restaurantId);
        }
        return next;
      });
    },
    []
  );

  // ─── Form lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    if (open) {
      setForm(initialData);
      setPreviewUrl(null);
      setSelectedFile(null);
      setIsSubmitting(false);
      setCreateModeSelection(new Set());
      setPendingLinks(new Set());
    }
  }, [open, initialData]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange(value);
    },
    [onOpenChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        let imageId: Id<"_storage"> | undefined;
        if (selectedFile) {
          imageId = await uploadFile(selectedFile);
        }

        const categoryId = await onSubmit(form, imageId);

        // Create mode: link selected restaurants after creation
        if (!editingId && createModeSelection.size > 0) {
          await Promise.all(
            Array.from(createModeSelection).map((restaurantId) =>
              linkMutation({
                restaurantId: restaurantId as Id<"restaurants">,
                foodCategoryId: categoryId as Id<"foodCategories">,
              })
            )
          );
        }

        handleOpenChange(false);
      } catch {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, selectedFile, uploadFile, onSubmit, editingId, createModeSelection, handleOpenChange]
  );

  const isBusy = isSubmitting || isUploading;
  const displayImage = previewUrl ?? existingImageUrl;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image */}
          <div className="space-y-2">
            <Label>Imagem</Label>
            <div
              className="relative aspect-[2/1] rounded-md border bg-muted cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Clique para selecionar</span>
                </div>
              )}
              {displayImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              maxLength={200}
            />
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="category-order">Ordem</Label>
            <Input
              id="category-order"
              type="number"
              min={0}
              value={form.order}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  order: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          {/* Active */}
          {editingId && (
            <div className="flex items-center justify-between">
              <Label htmlFor="category-active">Ativa</Label>
              <Switch
                id="category-active"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          )}

          {/* Restaurants */}
          <div className="space-y-2">
            <Label>Restaurantes vinculados</Label>
            {restaurants === undefined ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : uniqueRestaurants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum restaurante cadastrado.
              </p>
            ) : (
              <div className="max-h-[200px] overflow-y-auto rounded-md border p-3 space-y-3">
                {uniqueRestaurants.map((restaurant) => {
                  const isLinked = editingId
                    ? linkedIds.has(restaurant._id)
                    : createModeSelection.has(restaurant._id);
                  const isPending = pendingLinks.has(restaurant._id);

                  return (
                    <div
                      key={restaurant._id}
                      className="flex items-center gap-3"
                    >
                      <Checkbox
                        id={`cat-restaurant-${restaurant._id}`}
                        checked={isLinked}
                        disabled={isPending || isBusy}
                        onCheckedChange={() =>
                          editingId
                            ? handleToggleEdit(restaurant._id, isLinked)
                            : handleToggleCreate(restaurant._id)
                        }
                      />
                      <Label
                        htmlFor={`cat-restaurant-${restaurant._id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {restaurant.name}
                      </Label>
                      {isPending && (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isBusy}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isBusy || !form.name.trim()}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
