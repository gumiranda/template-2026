"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { useUploadFile } from "@/hooks/use-upload-file";
import { toast } from "sonner";

interface ModifierGroupInput {
  name: string;
  required: boolean;
  options: { name: string; price: number }[];
}

interface SaveParams {
  restaurantId: Id<"restaurants">;
  itemId?: Id<"menuItems">;
  name: string;
  description?: string;
  price: number;
  categoryId: Id<"menuCategories">;
  tags?: string[];
  isActive: boolean;
  imageFile?: File | null;
  removeImage?: boolean;
  modifierGroups: ModifierGroupInput[];
}

export function useMenuItemForm(restaurantId: Id<"restaurants">) {
  const router = useRouter();
  const createItem = useMutation(api.menu.createItem);
  const updateItem = useMutation(api.menu.updateItem);
  const saveModifierGroups = useMutation(api.menu.saveModifierGroups);
  const { uploadFile, isUploading } = useUploadFile();
  const [isSaving, setIsSaving] = useState(false);

  const save = async (params: SaveParams) => {
    setIsSaving(true);
    try {
      let imageId: Id<"_storage"> | undefined;
      if (params.imageFile) {
        imageId = await uploadFile(params.imageFile);
      }

      let menuItemId: Id<"menuItems">;

      if (params.itemId) {
        await updateItem({
          itemId: params.itemId,
          name: params.name.trim(),
          description: params.description?.trim() || undefined,
          price: params.price,
          categoryId: params.categoryId,
          tags: params.tags,
          isActive: params.isActive,
          ...(imageId ? { imageId } : {}),
          ...(params.removeImage ? { removeImage: true } : {}),
        });
        menuItemId = params.itemId;
      } else {
        menuItemId = await createItem({
          restaurantId: params.restaurantId,
          categoryId: params.categoryId,
          name: params.name.trim(),
          description: params.description?.trim() || undefined,
          price: params.price,
          tags: params.tags,
          ...(imageId ? { imageId } : {}),
        });
      }

      if (params.modifierGroups.length > 0) {
        await saveModifierGroups({
          menuItemId,
          groups: params.modifierGroups.map((g, gi) => ({
            name: g.name,
            required: g.required,
            order: gi,
            options: g.options.map((o, oi) => ({
              name: o.name,
              price: o.price,
              order: oi,
            })),
          })),
        });
      }

      toast.success(params.itemId ? "Item updated" : "Item created");
      router.push(`/admin/tenants/${restaurantId}/menu`);
    } catch {
      toast.error("Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving: isSaving || isUploading };
}
