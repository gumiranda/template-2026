"use client";

import { useState } from "react";
import { MenuCategoryWithItems, MenuItem } from "@/types";
import { MenuItemCard } from "./menu-item-card";
import { Button } from "@workspace/ui/components/button";

interface MenuDisplayProps {
  restaurantId: string;
  tableId: string;
  sessionId: string;
  menu: MenuCategoryWithItems[];
}

export function MenuDisplay({
  restaurantId,
  tableId,
  sessionId,
  menu,
}: MenuDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    menu.length > 0 ? menu[0]._id : null
  );

  const selectedCategoryData = menu.find(
    (cat) => cat._id === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="sticky top-16 bg-background z-30 border-b">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {menu.map((category) => (
            <Button
              key={category._id}
              variant={selectedCategory === category._id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category._id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {selectedCategoryData && selectedCategoryData.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedCategoryData.items
            .filter((item) => item.isActive)
            .map((item) => (
              <MenuItemCard
                key={item._id}
                restaurantId={restaurantId}
                tableId={tableId}
                sessionId={sessionId}
                item={item}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No items in this category
        </div>
      )}
    </div>
  );
}
