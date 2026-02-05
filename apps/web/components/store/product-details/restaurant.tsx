"use client";

import Image from "next/image";
import Link from "next/link";
import { DeliveryInfo } from "../delivery-info";
import { useProductDetailsContext } from "./context";

export function ProductDetailsRestaurant() {
  const { product } = useProductDetailsContext();
  const { restaurant } = product;

  return (
    <Link
      href={
        restaurant.slug
          ? `/r/${restaurant.slug}`
          : `/restaurants/${restaurant._id}`
      }
      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
    >
      {restaurant.logoUrl ? (
        <Image
          src={restaurant.logoUrl}
          alt={restaurant.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
          {restaurant.name.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium">{restaurant.name}</p>
        <DeliveryInfo
          deliveryFee={restaurant.deliveryFee}
          deliveryTimeMinutes={restaurant.deliveryTimeMinutes}
        />
      </div>
    </Link>
  );
}
