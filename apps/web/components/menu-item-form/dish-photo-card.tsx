"use client";

import { useCallback } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/menu-constants";

interface DishPhotoCardProps {
  imagePreview: string | null;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  onRemoveImage: () => void;
}

export function DishPhotoCard({
  imagePreview,
  imageFile,
  onImageChange,
  onRemoveImage,
}: DishPhotoCardProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageChange(file);
      }
    },
    [onImageChange]
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Label className="font-semibold">Dish Photo</Label>
          <Badge variant="outline" className="text-xs">
            Required
          </Badge>
        </div>

        {imagePreview ? (
          <div className="space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              <Image
                src={imagePreview}
                alt="Dish preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex gap-2">
              <Dropzone
                accept={ACCEPTED_IMAGE_TYPES}
                maxSize={MAX_IMAGE_SIZE_BYTES}
                onDrop={handleDrop}
                src={imageFile ? [imageFile] : undefined}
                className="flex-1 p-3"
              >
                <DropzoneContent>
                  <p className="text-sm font-medium">Change Photo</p>
                </DropzoneContent>
                <DropzoneEmptyState>
                  <p className="text-sm font-medium">Change Photo</p>
                </DropzoneEmptyState>
              </Dropzone>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={onRemoveImage}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Dropzone
            accept={ACCEPTED_IMAGE_TYPES}
            maxSize={MAX_IMAGE_SIZE_BYTES}
            onDrop={handleDrop}
          >
            <DropzoneEmptyState>
              <div className="flex flex-col items-center justify-center">
                <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <ImageIcon size={20} />
                </div>
                <p className="my-2 font-medium text-sm">Upload dish photo</p>
                <p className="text-muted-foreground text-xs">
                  JPG or PNG, max 5MB
                </p>
              </div>
            </DropzoneEmptyState>
          </Dropzone>
        )}
      </CardContent>
    </Card>
  );
}
