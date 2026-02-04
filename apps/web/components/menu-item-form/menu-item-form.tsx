"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useMenuItemForm } from "@/hooks/use-menu-item-form";
import { MenuItemFormHeader } from "./menu-item-form-header";
import { DishPhotoCard } from "./dish-photo-card";
import { DietaryTagsCard } from "./dietary-tags-card";
import { BasicInfoSection } from "./basic-info-section";
import { ModifiersSection, type ModifierGroup } from "./modifiers-section";
import { MenuItemFormFooter } from "./menu-item-form-footer";

interface MenuItemFormProps {
  restaurantId: Id<"restaurants">;
  itemId?: Id<"menuItems">;
}

export function MenuItemForm({ restaurantId, itemId }: MenuItemFormProps) {
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });
  const existingItem = useQuery(
    api.menu.getItemById,
    itemId ? { itemId } : "skip"
  );
  const { save, isSaving } = useMenuItemForm(restaurantId);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [initialized, setInitialized] = useState(!itemId);

  // Populate form with existing data
  useEffect(() => {
    if (!existingItem || initialized) return;

    setName(existingItem.name);
    setDescription(existingItem.description ?? "");
    setPrice(existingItem.price.toString());
    setCategoryId(existingItem.categoryId);
    setIsActive(existingItem.isActive);
    setTags(existingItem.tags ?? []);
    setImagePreview(existingItem.imageUrl ?? null);
    setModifierGroups(
      existingItem.modifierGroups.map((g) => ({
        name: g.name,
        required: g.required,
        options: g.options.map((o) => ({ name: o.name, price: o.price })),
      }))
    );
    setInitialized(true);
  }, [existingItem, initialized]);

  const categories = useMemo(() => {
    if (!menu) return [];
    return [...menu]
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ _id: c._id, name: c.name }));
  }, [menu]);

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
    setRemoveImage(false);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  }, []);

  const isValid = !!name.trim() && !!price && parseFloat(price) > 0 && !!categoryId;

  const handleSave = useCallback(() => {
    if (!isValid) return;

    save({
      restaurantId,
      itemId,
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      categoryId: categoryId as Id<"menuCategories">,
      tags: tags.length > 0 ? tags : undefined,
      isActive,
      imageFile,
      removeImage,
      modifierGroups,
    });
  }, [
    isValid,
    save,
    restaurantId,
    itemId,
    name,
    description,
    price,
    categoryId,
    tags,
    isActive,
    imageFile,
    removeImage,
    modifierGroups,
  ]);

  // Loading state
  if (menu === undefined || (itemId && existingItem === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Item not found
  if (itemId && existingItem === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-medium">Item not found</h3>
        <p className="text-muted-foreground text-sm">
          The menu item you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MenuItemFormHeader
        restaurantId={restaurantId}
        itemName={itemId ? existingItem?.name : undefined}
        isActive={isActive}
        onIsActiveChange={setIsActive}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 1/3 */}
        <div className="space-y-6">
          <DishPhotoCard
            imagePreview={imagePreview}
            imageFile={imageFile}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
          />
          <DietaryTagsCard tags={tags} onTagsChange={setTags} />
        </div>

        {/* Right column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <BasicInfoSection
            name={name}
            onNameChange={setName}
            price={price}
            onPriceChange={setPrice}
            categoryId={categoryId}
            onCategoryIdChange={setCategoryId}
            description={description}
            onDescriptionChange={setDescription}
            categories={categories}
          />
          <ModifiersSection
            groups={modifierGroups}
            onGroupsChange={setModifierGroups}
          />
        </div>
      </div>

      <MenuItemFormFooter
        restaurantId={restaurantId}
        isSaving={isSaving}
        isValid={isValid}
        onSave={handleSave}
      />
    </div>
  );
}
