"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type ErrorVariant = "warning" | "error" | "info";

const VARIANT_CONFIG: Record<ErrorVariant, string> = {
  warning: "text-yellow-500",
  error: "text-destructive",
  info: "text-muted-foreground",
};

interface SessionErrorScreenProps {
  title: string;
  description: string;
  secondaryDescription?: string;
  variant?: ErrorVariant;
  actionLabel?: string;
  onAction?: () => void;
}

export function SessionErrorScreen({
  title,
  description,
  secondaryDescription,
  variant = "info",
  actionLabel,
  onAction,
}: SessionErrorScreenProps) {
  const iconClass = VARIANT_CONFIG[variant];

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <AlertCircle className={cn("mx-auto h-12 w-12 mb-4", iconClass)} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      {secondaryDescription && (
        <p className="mt-1 text-muted-foreground">{secondaryDescription}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
