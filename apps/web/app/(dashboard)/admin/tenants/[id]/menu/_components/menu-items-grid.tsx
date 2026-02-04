import Image from "next/image";
import Link from "next/link";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { Pencil, Trash2, UtensilsCrossed, ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { MenuItemData } from "./menu-types";

interface MenuItemsGridProps {
  items: MenuItemData[];
  restaurantId: Id<"restaurants">;
  hasCategory: boolean;
  hasCategories: boolean;
  hasFilters: boolean;
  onToggleItemStatus: (itemId: Id<"menuItems">, isActive: boolean) => void;
  onDeleteItem: (item: { _id: Id<"menuItems">; name: string }) => void;
}

export function MenuItemsGrid({
  items,
  restaurantId,
  hasCategory,
  hasCategories,
  hasFilters,
  onToggleItemStatus,
  onDeleteItem,
}: MenuItemsGridProps) {
  if (!hasCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No category selected</h3>
        <p className="text-muted-foreground text-sm">
          {!hasCategories
            ? "Create a category to get started"
            : "Select a category from the sidebar to view items"}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No items found</h3>
        <p className="text-muted-foreground text-sm">
          {hasFilters
            ? "Try adjusting your search or filter"
            : "Add items to this category"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item._id} className="overflow-hidden">
          <div className="relative aspect-[4/3] bg-muted">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
              </div>
            )}
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              {formatCurrency(item.price)}
            </Badge>
            {!item.isActive && (
              <Badge
                variant="destructive"
                className="absolute top-2 left-2"
              >
                SOLD OUT
              </Badge>
            )}
          </div>

          <CardContent className="p-3 space-y-2">
            <h3 className="font-semibold text-sm truncate">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.isActive}
                  onCheckedChange={(checked) =>
                    onToggleItemStatus(item._id, checked)
                  }
                  className="scale-75"
                />
                <span className="text-xs text-muted-foreground">
                  {item.isActive ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                >
                  <Link
                    href={`/admin/tenants/${restaurantId}/menu/items/${item._id}/edit`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDeleteItem(item)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
