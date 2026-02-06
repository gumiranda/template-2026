"use client";

import Image from "next/image";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Pencil, Trash2, ImageIcon } from "lucide-react";

interface BannerCardProps {
  banner: {
    _id: string;
    title: string;
    imageUrl: string | null;
    linkUrl?: string;
    order: number;
    isActive: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function BannerCard({ banner, onEdit, onDelete }: BannerCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/1] bg-muted">
        {banner.imageUrl ? (
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant={banner.isActive ? "default" : "secondary"}>
            {banner.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{banner.title}</h3>
            <p className="text-sm text-muted-foreground">
              Ordem: {banner.order}
            </p>
            {banner.linkUrl && (
              <p className="text-xs text-muted-foreground truncate">
                Link: {banner.linkUrl}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar banner">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir banner">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
