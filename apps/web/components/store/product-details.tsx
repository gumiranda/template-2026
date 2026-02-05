"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { DiscountBadge } from "./discount-badge";
import { DeliveryInfo } from "./delivery-info";
import { useCart } from "@/hooks/use-cart";
import { useSessionCart } from "@/hooks/use-session-cart";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import type { Id } from "@workspace/backend/_generated/dataModel";
import type { SelectedModifier } from "@/lib/atoms/cart";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

interface ModifierOption {
  _id: Id<"modifierOptions">;
  name: string;
  price: number;
}

interface ModifierGroup {
  _id: Id<"modifierGroups">;
  name: string;
  required: boolean;
  order: number;
  options: ModifierOption[];
}

interface ProductDetailsProps {
  product: {
    _id: Id<"menuItems">;
    name: string;
    description?: string;
    price: number;
    discountPercentage: number;
    discountedPrice: number;
    imageUrl: string | null;
    restaurantId: Id<"restaurants">;
    tags: string[];
    modifierGroups: ModifierGroup[];
    restaurant: {
      _id: Id<"restaurants">;
      name: string;
      slug?: string | null;
      logoUrl: string | null;
      deliveryFee: number;
      deliveryTimeMinutes: number;
    };
  };
}

// Map groupId -> selected optionId
type ModifierSelections = Record<string, string>;

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<ModifierSelections>({});
  const orderContext = useAtomValue(orderContextAtom);
  const isDineIn = orderContext.type === "dine_in";

  // Hooks always called (rules of hooks)
  const { addToCart: addToDeliveryCart, setCartDeliveryFee } = useCart();
  const sessionCart = useSessionCart(isDineIn ? orderContext.sessionId : null);

  const selectOption = useCallback(
    (groupId: string, optionId: string) => {
      setSelections((prev) => {
        // Toggle off if already selected
        if (prev[groupId] === optionId) {
          const next = { ...prev };
          delete next[groupId];
          return next;
        }
        return { ...prev, [groupId]: optionId };
      });
    },
    []
  );

  const selectedModifiers = useMemo((): SelectedModifier[] => {
    const result: SelectedModifier[] = [];
    for (const group of product.modifierGroups) {
      const selectedOptionId = selections[group._id];
      if (!selectedOptionId) continue;
      const option = group.options.find((o) => o._id === selectedOptionId);
      if (option) {
        result.push({
          groupName: group.name,
          optionName: option.name,
          price: option.price,
        });
      }
    }
    return result;
  }, [product.modifierGroups, selections]);

  const modifiersTotal = useMemo(
    () => selectedModifiers.reduce((sum, m) => sum + m.price, 0),
    [selectedModifiers]
  );

  const unitPrice = product.discountedPrice + modifiersTotal;

  const requiredGroupsMissing = useMemo(() => {
    return product.modifierGroups
      .filter((g) => g.required)
      .some((g) => !selections[g._id]);
  }, [product.modifierGroups, selections]);

  const handleAddToCart = async () => {
    if (isDineIn) {
      // Dine-in: use session cart (server-side)
      await sessionCart.addToCart(
        product._id,
        quantity,
        selectedModifiers.length > 0 ? selectedModifiers : undefined
      );
      toast.success("Adicionado ao pedido", {
        description: `${quantity}x ${product.name}`,
      });
    } else {
      // Delivery: use Jotai cart (client-side)
      addToDeliveryCart(
        {
          menuItemId: product._id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice,
          imageUrl: product.imageUrl,
          restaurantId: product.restaurantId,
          restaurantName: product.restaurant.name,
          selectedModifiers:
            selectedModifiers.length > 0 ? selectedModifiers : undefined,
        },
        quantity
      );
      setCartDeliveryFee(product.restaurant.deliveryFee);
      toast.success("Adicionado ao carrinho", {
        description: `${quantity}x ${product.name}`,
      });
    }
    setQuantity(1);
    setSelections({});
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-bold text-muted-foreground/30">
            {product.name.charAt(0)}
          </div>
        )}
        {product.discountPercentage > 0 && (
          <div className="absolute left-4 top-4">
            <DiscountBadge percentage={product.discountPercentage} />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.description && (
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          )}
        </div>

        {/* Dietary Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(product.discountedPrice)}
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <Link
          href={
            product.restaurant.slug
              ? `/r/${product.restaurant.slug}`
              : `/restaurants/${product.restaurant._id}`
          }
          className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
        >
          {product.restaurant.logoUrl ? (
            <Image
              src={product.restaurant.logoUrl}
              alt={product.restaurant.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
              {product.restaurant.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium">{product.restaurant.name}</p>
            <DeliveryInfo
              deliveryFee={product.restaurant.deliveryFee}
              deliveryTimeMinutes={product.restaurant.deliveryTimeMinutes}
            />
          </div>
        </Link>

        {/* Modifier Groups */}
        {product.modifierGroups.length > 0 && (
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
                          <span className="text-sm font-medium">
                            {option.name}
                          </span>
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
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            className="flex-1"
            size="lg"
            onClick={handleAddToCart}
            disabled={requiredGroupsMissing}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Adicionar {formatCurrency(unitPrice * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}
