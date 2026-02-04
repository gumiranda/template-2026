"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RestaurantLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: Id<"foodCategories">;
  categoryName: string;
}

export function RestaurantLinkDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
}: RestaurantLinkDialogProps) {
  const restaurants = useQuery(api.restaurants.listAllWithStats);
  const categoryWithLinks = useQuery(
    api.foodCategories.getFoodCategoryWithProducts,
    { foodCategoryId: categoryId }
  );

  const linkMutation = useMutation(api.foodCategories.linkRestaurantToCategory);
  const unlinkMutation = useMutation(
    api.foodCategories.unlinkRestaurantFromCategory
  );

  const [pending, setPending] = useState<Set<string>>(new Set());

  const linkedRestaurantIds = useMemo(() => {
    if (!categoryWithLinks?.restaurants) return new Set<string>();
    return new Set(
      categoryWithLinks.restaurants.map((r) => r._id as string)
    );
  }, [categoryWithLinks]);

  const handleToggle = useCallback(
    async (restaurantId: string, isCurrentlyLinked: boolean) => {
      setPending((prev) => new Set(prev).add(restaurantId));
      try {
        if (isCurrentlyLinked) {
          await unlinkMutation({
            restaurantId: restaurantId as Id<"restaurants">,
            foodCategoryId: categoryId,
          });
          toast.success("Restaurante desvinculado");
        } else {
          await linkMutation({
            restaurantId: restaurantId as Id<"restaurants">,
            foodCategoryId: categoryId,
          });
          toast.success("Restaurante vinculado");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao atualizar vinculo"
        );
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(restaurantId);
          return next;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryId]
  );

  const isLoading = restaurants === undefined || categoryWithLinks === undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restaurantes - {categoryName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !restaurants || restaurants.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Nenhum restaurante cadastrado.
          </p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-3 py-2">
            {restaurants.map((restaurant) => {
              const isLinked = linkedRestaurantIds.has(restaurant._id);
              const isPending = pending.has(restaurant._id);

              return (
                <div
                  key={restaurant._id}
                  className="flex items-center gap-3 px-1"
                >
                  <Checkbox
                    id={`restaurant-${restaurant._id}`}
                    checked={isLinked}
                    disabled={isPending}
                    onCheckedChange={() =>
                      handleToggle(restaurant._id, isLinked)
                    }
                  />
                  <Label
                    htmlFor={`restaurant-${restaurant._id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {restaurant.name}
                  </Label>
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
