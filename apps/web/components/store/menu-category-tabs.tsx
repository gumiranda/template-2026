import type { ReactNode } from "react";
import type { Id } from "@workspace/backend/_generated/dataModel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";

export interface MenuTabItem {
  _id: Id<"menuItems">;
  name: string;
  description?: string;
  price: number;
  discountPercentage?: number;
  discountedPrice: number;
  imageUrl: string | null;
}

export interface MenuTabCategory {
  _id: string;
  name: string;
  items: MenuTabItem[];
}

interface MenuCategoryTabsProps {
  categories: MenuTabCategory[];
  renderItem: (item: MenuTabItem) => ReactNode;
  gridClassName?: string;
  emptyMessage?: string;
}

export function MenuCategoryTabs({
  categories,
  renderItem,
  gridClassName,
  emptyMessage = "Nenhum item no cardápio ainda.",
}: MenuCategoryTabsProps) {
  if (categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
    );
  }

  return (
    <Tabs defaultValue={categories[0]?._id}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {categories.map((category) => (
          <TabsTrigger key={category._id} value={category._id}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category) => (
        <TabsContent key={category._id} value={category._id}>
          <div
            className={cn(
              "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
              gridClassName
            )}
          >
            {category.items.map((item) => renderItem(item))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
