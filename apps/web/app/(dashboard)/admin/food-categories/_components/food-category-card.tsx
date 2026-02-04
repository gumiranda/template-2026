"use client";

import Image from "next/image";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Pencil, Trash2, ImageIcon } from "lucide-react";

interface FoodCategoryCardProps {
  category: {
    _id: string;
    name: string;
    imageUrl: string | null;
    order: number;
    isActive: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function FoodCategoryCard({
  category,
  onEdit,
  onDelete,
}: FoodCategoryCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[2/1] bg-muted">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={category.isActive ? "default" : "secondary"}>
            {category.isActive ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </div>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              Ordem: {category.order}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
