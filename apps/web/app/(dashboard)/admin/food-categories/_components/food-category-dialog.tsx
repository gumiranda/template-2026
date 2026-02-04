"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
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
import { Loader2, Upload, ImageIcon } from "lucide-react";
import type { Id } from "@workspace/backend/_generated/dataModel";
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
  ) => Promise<void>;
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

  useEffect(() => {
    if (open) {
      setForm(initialData);
      setPreviewUrl(null);
      setSelectedFile(null);
      setIsSubmitting(false);
    }
  }, [open, initialData]);

  const resetState = useCallback(() => {
    setForm(initialData);
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsSubmitting(false);
  }, [initialData]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) resetState();
      onOpenChange(value);
    },
    [onOpenChange, resetState]
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
        await onSubmit(form, imageId);
        handleOpenChange(false);
      } catch {
        setIsSubmitting(false);
      }
    },
    [form, selectedFile, uploadFile, onSubmit, handleOpenChange]
  );

  const isBusy = isSubmitting || isUploading;
  const displayImage = previewUrl ?? existingImageUrl;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
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
