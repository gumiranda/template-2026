"use client";

import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { MenuItem } from "@/types";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";

interface MenuItemCardProps {
  restaurantId: string;
  tableId: string;
  sessionId: string;
  item: MenuItem;
}

export function MenuItemCard({
  restaurantId,
  tableId,
  sessionId,
  item,
}: MenuItemCardProps) {
  const addToSessionCart = useMutation(api.sessions.addToSessionCart);
  const addToGeneralCart = useMutation(api.carts.addToCart);

  const handleAddToSession = async () => {
    await addToSessionCart({
      sessionId,
      menuItemId: item._id,
      quantity: 1,
      price: item.price,
    });
  };

  const handleAddToGeneral = async () => {
    await addToGeneralCart({
      tableId: tableId as any,
      restaurantId: restaurantId as any,
      menuItemId: item._id,
      quantity: 1,
      price: item.price,
    });
  };

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
                title="Add to session cart (send to waiter)"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleAddToGeneral}
                title="Add to general cart (for bill)"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
