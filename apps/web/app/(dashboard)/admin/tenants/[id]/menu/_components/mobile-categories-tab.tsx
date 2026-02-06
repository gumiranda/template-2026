import { useMemo } from "react";
import Image from "next/image";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { GripVertical, Pencil, Plus, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getCategoryIcon } from "@/lib/menu-constants";
import type { CategoryData } from "./menu-types";
import { MOBILE_HIGHLIGHTS_COUNT } from "./menu-types";

interface MobileCategoriesTabProps {
  categories: CategoryData[];
  selectedCategoryId: Id<"menuCategories"> | null;
  onSelectCategory: (id: Id<"menuCategories">) => void;
  onEditCategory: (cat: { _id: Id<"menuCategories">; name: string; description?: string; icon?: string }) => void;
  onAddCategory: () => void;
  onDragStart: (id: Id<"menuCategories">) => void;
  onDragOver: (e: React.DragEvent, targetId: Id<"menuCategories">) => void;
  onDragEnd: () => void;
}

export function MobileCategoriesTab({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEditCategory,
  onAddCategory,
  onDragStart,
  onDragOver,
  onDragEnd,
}: MobileCategoriesTabProps) {
  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const activeCounts = useMemo(
    () => new Map(categories.map((c) => [c._id, c.items.filter((i) => i.isActive).length])),
    [categories]
  );

  const highlightItems = useMemo(
    () => selectedCategory?.items.filter((i) => i.isActive).slice(0, MOBILE_HIGHLIGHTS_COUNT) ?? [],
    [selectedCategory]
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Minhas Categorias</h2>
        <Button variant="outline" size="sm" onClick={onAddCategory}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nova
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Crie sua primeira categoria para começar
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-md border">
          {categories.map((category) => {
            const iconData = getCategoryIcon(category.icon);
            const Icon = iconData.icon;
            const activeCount = activeCounts.get(category._id) ?? 0;

            return (
              <div
                key={category._id}
                draggable
                onDragStart={() => onDragStart(category._id)}
                onDragOver={(e) => onDragOver(e, category._id)}
                onDragEnd={onDragEnd}
                onClick={() => onSelectCategory(category._id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors",
                  selectedCategoryId === category._id ? "bg-muted" : "hover:bg-muted/50"
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40 cursor-grab" />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeCount} {activeCount === 1 ? "item ativo" : "itens ativos"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {selectedCategory && highlightItems.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Destaques: {selectedCategory.name}
          </h3>
          <div className="divide-y rounded-md border">
            {highlightItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3 px-3 py-2">
                {item.imageUrl ? (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="flex-1 text-sm truncate">{item.name}</span>
                <span className="text-sm font-medium text-primary">
                  {formatCurrency(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
