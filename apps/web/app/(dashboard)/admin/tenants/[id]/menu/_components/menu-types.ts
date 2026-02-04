import type { Id } from "@workspace/backend/_generated/dataModel";

export type FilterStatus = "all" | "in_stock" | "out_of_stock";

export interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
}

export interface CategoryData {
  _id: Id<"menuCategories">;
  name: string;
  description?: string;
  icon?: string;
  items: MenuItemData[];
}

export interface MenuItemData {
  _id: Id<"menuItems">;
  name: string;
  description?: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export const MOBILE_HIGHLIGHTS_COUNT = 3;
