import { Id } from "@workspace/backend/_generated/dataModel";

export interface MenuItem {
  _id: Id<"menuItems">;
  _creationTime: number;
  restaurantId: Id<"restaurants">;
  categoryId: Id<"menuCategories">;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface MenuCategoryWithItems {
  _id: Id<"menuCategories">;
  _creationTime: number;
  restaurantId: Id<"restaurants">;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  items: MenuItem[];
}
