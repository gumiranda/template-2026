"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Plus, Minus, Search } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface MenuItemSelectorProps {
  restaurantId: Id<"restaurants">;
  onAddItem: (menuItemId: Id<"menuItems">, quantity: number) => void;
  isAddingItem: boolean;
}

export function MenuItemSelector({
  restaurantId,
  onAddItem,
  isAddingItem,
}: MenuItemSelectorProps) {
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredMenu = useMemo(() => {
    if (!menu) return [];
    if (!searchQuery.trim()) return menu;

    const query = searchQuery.toLowerCase();
    return menu
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.isActive &&
            (item.name.toLowerCase().includes(query) ||
              item.description?.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [menu, searchQuery]);

  const getQuantity = (itemId: string) => quantities[itemId] ?? 1;

  const setQuantity = (itemId: string, value: number) => {
    if (value < 1) value = 1;
    if (value > 99) value = 99;
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleAddItem = (menuItemId: Id<"menuItems">) => {
    const qty = getQuantity(menuItemId);
    onAddItem(menuItemId, qty);
    setQuantities((prev) => ({ ...prev, [menuItemId]: 1 }));
  };

  if (menu === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (menu.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum item no cardápio
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredMenu.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Nenhum item encontrado
        </div>
      ) : (
        <Accordion type="multiple" className="w-full" defaultValue={filteredMenu[0] ? [filteredMenu[0]._id] : []}>
          {filteredMenu.map((category) => {
            const activeItems = category.items.filter((item) => item.isActive);
            if (activeItems.length === 0) return null;

            return (
              <AccordionItem key={category._id} value={category._id}>
                <AccordionTrigger className="text-sm font-medium">
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {activeItems.length}
                  </Badge>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {activeItems.map((item) => {
                      const qty = getQuantity(item._id);
                      const hasDiscount =
                        item.discountPercentage && item.discountPercentage > 0;
                      const discountedPrice = hasDiscount
                        ? item.price * (1 - (item.discountPercentage ?? 0) / 100)
                        : item.price;

                      return (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 p-2 rounded-md border bg-card"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              {item.name.charAt(0)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2">
                              {hasDiscount ? (
                                <>
                                  <span className="text-xs line-through text-muted-foreground">
                                    {formatCurrency(item.price)}
                                  </span>
                                  <span className="text-sm font-medium text-green-600">
                                    {formatCurrency(discountedPrice)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {formatCurrency(item.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setQuantity(item._id, qty - 1)}
                              disabled={qty <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              max={99}
                              value={qty}
                              onChange={(e) =>
                                setQuantity(item._id, parseInt(e.target.value, 10) || 1)
                              }
                              className="h-7 w-12 text-center text-sm px-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setQuantity(item._id, qty + 1)}
                              disabled={qty >= 99}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleAddItem(item._id)}
                            disabled={isAddingItem}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
