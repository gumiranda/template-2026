import Image from "next/image";
import Link from "next/link";
import type { Id } from "@workspace/backend/_generated/dataModel";

interface CategoryItemProps {
  category: {
    _id: Id<"foodCategories">;
    name: string;
    imageUrl: string | null;
  };
}

export function CategoryItem({ category }: CategoryItemProps) {
  return (
    <Link
      href={`/categories/${category._id}`}
      className="flex flex-col items-center gap-2 min-w-[80px] group"
    >
      <div className="relative h-16 w-16 rounded-full bg-muted overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground/50">
            {category.name.charAt(0)}
          </div>
        )}
      </div>
      <span className="text-xs text-center font-medium line-clamp-1">
        {category.name}
      </span>
    </Link>
  );
}
