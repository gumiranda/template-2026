"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { MenuItem } from "@/types";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MenuItemCardProps {
  restaurantId: Id<"restaurants">;
  tableId: Id<"tables">;
  sessionId: string;
  item: MenuItem;
}

export function MenuItemCard({
  restaurantId,
  tableId,
  sessionId,
  item,
}: MenuItemCardProps) {
  const [isAddingToSession, setIsAddingToSession] = useState(false);
  const [isAddingToGeneral, setIsAddingToGeneral] = useState(false);

  const addToSessionCart = useMutation(api.sessions.addToSessionCart);
  const addToGeneralCart = useMutation(api.carts.addToCart);

  const handleAddToSession = async () => {
    setIsAddingToSession(true);
    try {
      await addToSessionCart({
        sessionId,
        menuItemId: item._id,
        quantity: 1,
        price: item.price,
      });
      toast.success("Added to session cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add item");
    } finally {
      setIsAddingToSession(false);
    }
  };

  const handleAddToGeneral = async () => {
    setIsAddingToGeneral(true);
    try {
      await addToGeneralCart({
        tableId,
        restaurantId,
        menuItemId: item._id,
        quantity: 1,
        price: item.price,
      });
      toast.success("Added to general cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add item");
    } finally {
      setIsAddingToGeneral(false);
    }
  };

  const isLoading = isAddingToSession || isAddingToGeneral;

  return (
    <Card className="overflow-hidden">
      {item.imageUrl && (
        <div className="aspect-video w-full bg-muted">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              R$ {item.price.toFixed(2)}
            </span>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleAddToSession}
                disabled={isLoading}
                title="Add to session cart (send to waiter)"
              >
                {isAddingToSession ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                onClick={handleAddToGeneral}
                disabled={isLoading}
                title="Add to general cart (for bill)"
              >
                {isAddingToGeneral ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
