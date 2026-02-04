import {
  UtensilsCrossed,
  Wine,
  Coffee,
  Cake,
  Beef,
  Salad,
  Fish,
  Pizza,
  Sandwich,
  Egg,
  Leaf,
  IceCreamCone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryIconEntry {
  id: string;
  label: string;
  icon: LucideIcon;
}

const DEFAULT_CATEGORY_ICON: CategoryIconEntry = {
  id: "utensils-crossed",
  label: "Pratos",
  icon: UtensilsCrossed,
};

export const CATEGORY_ICONS: CategoryIconEntry[] = [
  DEFAULT_CATEGORY_ICON,
  { id: "wine", label: "Bebidas", icon: Wine },
  { id: "coffee", label: "Café", icon: Coffee },
  { id: "cake", label: "Sobremesas", icon: Cake },
  { id: "beef", label: "Carnes", icon: Beef },
  { id: "salad", label: "Saladas", icon: Salad },
  { id: "fish", label: "Peixes", icon: Fish },
  { id: "pizza", label: "Pizza", icon: Pizza },
  { id: "sandwich", label: "Lanches", icon: Sandwich },
  { id: "egg", label: "Ovos", icon: Egg },
  { id: "leaf", label: "Vegano", icon: Leaf },
  { id: "ice-cream-cone", label: "Sorvetes", icon: IceCreamCone },
];

export function getCategoryIcon(iconId?: string): CategoryIconEntry {
  return CATEGORY_ICONS.find((i) => i.id === iconId) ?? DEFAULT_CATEGORY_ICON;
}

export const PREDEFINED_TAGS = [
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Spicy",
  "Nut-Free",
  "Dairy-Free",
  "Organic",
  "Sugar-Free",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};
