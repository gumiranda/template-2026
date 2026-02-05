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
import { toast } from "sonner";
import type { BannerFormData } from "./banner-types";

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: BannerFormData;
  existingImageUrl?: string | null;
  editingId?: string;
  onSubmit: (
    data: BannerFormData,
    imageId: Id<"_storage"> | undefined
  ) => Promise<void>;
  uploadFile: (file: File) => Promise<Id<"_storage">>;
  isUploading: boolean;
}

export function BannerDialog({
  open,
  onOpenChange,
  initialData,
  existingImageUrl,
  editingId,
  onSubmit,
  uploadFile,
  isUploading,
}: BannerDialogProps) {
  const [form, setForm] = useState<BannerFormData>(initialData);
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
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao salvar banner"
        );
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
            {editingId ? "Editar Banner" : "Novo Banner"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Imagem</Label>
            <button
              type="button"
              className="relative aspect-[3/1] w-full rounded-md border bg-muted cursor-pointer overflow-hidden"
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
            </button>
            <input
              name="banner-image"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-title">Título</Label>
            <Input
              id="banner-title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-link">Link (opcional)</Label>
            <Input
              id="banner-link"
              value={form.linkUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, linkUrl: e.target.value }))
              }
              placeholder="/promo ou https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-order">Ordem</Label>
            <Input
              id="banner-order"
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

          {editingId && (
            <div className="flex items-center justify-between">
              <Label htmlFor="banner-active">Ativo</Label>
              <Switch
                id="banner-active"
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
            <Button type="submit" disabled={isBusy || !form.title.trim()}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
