"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";

export function useUploadFile() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await result.json();
      return storageId as Id<"_storage">;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}
