import type { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { CategoryData } from "./menu-types";

interface DesktopCategorySidebarProps {
  categories: CategoryData[];
  selectedCategoryId: Id<"menuCategories"> | null;
  onSelectCategory: (id: Id<"menuCategories">) => void;
  onEditCategory: (cat: { _id: Id<"menuCategories">; name: string; description?: string; icon?: string }) => void;
  onDeleteCategory: (cat: { _id: Id<"menuCategories">; name: string }) => void;
  onAddCategory: () => void;
  onDragStart: (id: Id<"menuCategories">) => void;
  onDragOver: (e: React.DragEvent, targetId: Id<"menuCategories">) => void;
  onDragEnd: () => void;
}

export function DesktopCategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DesktopCategorySidebarProps) {
  return (
    <div className="hidden lg:block w-72 shrink-0">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <h2 className="font-semibold text-sm">Menu Categories</h2>
            <p className="text-xs text-muted-foreground">
              Drag handles to reorder
            </p>
          </div>

          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category._id}
                draggable
                onDragStart={() => onDragStart(category._id)}
                onDragOver={(e) => onDragOver(e, category._id)}
                onDragEnd={onDragEnd}
                onClick={() => onSelectCategory(category._id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer group transition-colors",
                  selectedCategoryId === category._id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 opacity-40 cursor-grab" />
                <span className="text-sm font-medium truncate flex-1">
                  {category.name}
                </span>
                <Badge
                  variant={selectedCategoryId === category._id ? "secondary" : "outline"}
                  className="text-xs h-5 px-1.5"
                >
                  {category.items.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 opacity-0 group-hover:opacity-100",
                    selectedCategoryId === category._id &&
                      "hover:bg-primary-foreground/20 text-primary-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 opacity-0 group-hover:opacity-100",
                    selectedCategoryId === category._id &&
                      "hover:bg-primary-foreground/20 text-primary-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={onAddCategory}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
