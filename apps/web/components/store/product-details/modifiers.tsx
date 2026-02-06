"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { formatCurrency } from "@/lib/format";
import { useProductDetailsContext } from "./context";

export function ProductDetailsModifiers() {
  const { product, selections, selectOption } = useProductDetailsContext();

  if (product.modifierGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Separator />
      {product.modifierGroups.map((group) => (
        <div key={group._id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="font-semibold">{group.name}</Label>
            {group.required && (
              <Badge variant="destructive" className="text-xs h-5">
                Obrigatório
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {group.options.map((option) => {
              const isSelected = selections[group._id] === option._id;
              return (
                <button
                  key={option._id}
                  type="button"
                  onClick={() => selectOption(group._id, option._id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{option.name}</span>
                  </div>
                  {option.price > 0 && (
                    <span className="text-sm text-muted-foreground">
                      + {formatCurrency(option.price)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Separator />
    </div>
  );
}
