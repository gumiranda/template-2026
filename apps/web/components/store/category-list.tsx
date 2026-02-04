"use client";

import { CategoryItem } from "./category-item";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import type { Id } from "@workspace/backend/_generated/dataModel";

interface Category {
  _id: Id<"foodCategories">;
  name: string;
  imageUrl: string | null;
}

interface CategoryListProps {
  categories: Category[] | undefined;
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories === undefined) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-6 pb-4">
        {categories.map((category) => (
          <CategoryItem key={category._id} category={category} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
