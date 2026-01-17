"use client";

import { Loader2 } from "lucide-react";

type FullPageLoaderProps = {
  message?: string;
};

export function FullPageLoader({ message }: FullPageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      {message && <p className="text-muted-foreground">{message}</p>}
    </div>
  );
}
