"use client";

import {
  createContext,
  use,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { useMenuItemForm } from "@/hooks/use-menu-item-form";
import type { ModifierGroup } from "./modifiers-section";

interface Category {
  _id: Id<"menuCategories">;
  name: string;
}

interface MenuItemFormContextValue {
  // State
  name: string;
  description: string;
  price: string;
  categoryId: string;
  isActive: boolean;
  tags: string[];
  imageFile: File | null;
  imagePreview: string | null;
  modifierGroups: ModifierGroup[];
  isSaving: boolean;
  isValid: boolean;

  // Actions
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setPrice: (value: string) => void;
  setCategoryId: (value: string) => void;
  setIsActive: (value: boolean) => void;
  setTags: (tags: string[]) => void;
  handleImageChange: (file: File | null) => void;
  handleRemoveImage: () => void;
  setModifierGroups: (groups: ModifierGroup[]) => void;
  handleSave: () => void;

  // Meta
  restaurantId: Id<"restaurants">;
  itemId?: Id<"menuItems">;
  existingItemName?: string;
  categories: Category[];
}

const MenuItemFormContext = createContext<MenuItemFormContextValue | null>(null);

export function useMenuItemFormContext() {
  const context = use(MenuItemFormContext);
  if (!context) {
    throw new Error(
      "MenuItemForm components must be used within MenuItemFormProvider"
    );
  }
  return context;
}

interface MenuItemFormProviderProps {
  restaurantId: Id<"restaurants">;
  itemId?: Id<"menuItems">;
  children: ReactNode;
}

export function MenuItemFormProvider({
  restaurantId,
  itemId,
  children,
}: MenuItemFormProviderProps) {
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });
  const existingItem = useQuery(
    api.menu.getItemById,
    itemId ? { itemId } : "skip"
  );
  const { save, isSaving } = useMenuItemForm(restaurantId);

  // Form state - initialized from existingItem if editing
  // Component should be remounted with key prop when itemId changes
  const [name, setName] = useState(existingItem?.name ?? "");
  const [description, setDescription] = useState(existingItem?.description ?? "");
  const [price, setPrice] = useState(existingItem?.price.toString() ?? "");
  const [categoryId, setCategoryId] = useState(existingItem?.categoryId ?? "");
  const [isActive, setIsActive] = useState(existingItem?.isActive ?? true);
  const [tags, setTags] = useState<string[]>(existingItem?.tags ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    existingItem?.imageUrl ?? null
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(
    existingItem?.modifierGroups.map((g) => ({
      name: g.name,
      required: g.required,
      options: g.options.map((o) => ({ name: o.name, price: o.price })),
    })) ?? []
  );

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

  const isValid =
    !!name.trim() && !!price && parseFloat(price) > 0 && !!categoryId;

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

  const value = useMemo<MenuItemFormContextValue>(
    () => ({
      name,
      description,
      price,
      categoryId,
      isActive,
      tags,
      imageFile,
      imagePreview,
      modifierGroups,
      isSaving,
      isValid,
      setName,
      setDescription,
      setPrice,
      setCategoryId,
      setIsActive,
      setTags,
      handleImageChange,
      handleRemoveImage,
      setModifierGroups,
      handleSave,
      restaurantId,
      itemId,
      existingItemName: existingItem?.name,
      categories,
    }),
    [
      name,
      description,
      price,
      categoryId,
      isActive,
      tags,
      imageFile,
      imagePreview,
      modifierGroups,
      isSaving,
      isValid,
      handleImageChange,
      handleRemoveImage,
      handleSave,
      restaurantId,
      itemId,
      existingItem?.name,
      categories,
    ]
  );

  return (
    <MenuItemFormContext value={value}>
      {children}
    </MenuItemFormContext>
  );
}

// Export loading/error state helpers
export function useMenuItemFormLoading(
  restaurantId: Id<"restaurants">,
  itemId?: Id<"menuItems">
) {
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });
  const existingItem = useQuery(
    api.menu.getItemById,
    itemId ? { itemId } : "skip"
  );

  return {
    isLoading: menu === undefined || (itemId && existingItem === undefined),
    notFound: itemId && existingItem === null,
  };
}
