"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { DiscountBadge } from "./discount-badge";
import { DeliveryInfo } from "./delivery-info";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import type { Id } from "@workspace/backend/_generated/dataModel";
import Link from "next/link";

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
    restaurant: {
      _id: Id<"restaurants">;
      name: string;
      logoUrl: string | null;
      deliveryFee: number;
      deliveryTimeMinutes: number;
    };
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, setCartDeliveryFee } = useCart();

  const handleAddToCart = () => {
    addToCart(
      {
        menuItemId: product._id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice,
        imageUrl: product.imageUrl,
        restaurantId: product.restaurantId,
        restaurantName: product.restaurant.name,
      },
      quantity
    );
    setCartDeliveryFee(product.restaurant.deliveryFee);
    toast.success("Adicionado ao carrinho", {
      description: `${quantity}x ${product.name}`,
    });
    setQuantity(1);
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
          href={`/restaurants/${product.restaurant._id}`}
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

          <Button className="flex-1" size="lg" onClick={handleAddToCart}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Adicionar {formatCurrency(product.discountedPrice * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}
