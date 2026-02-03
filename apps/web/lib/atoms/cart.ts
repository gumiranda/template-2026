import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Id } from "@workspace/backend/_generated/dataModel";

export interface CartItem {
  menuItemId: Id<"menuItems">;
  name: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imageUrl: string | null;
  restaurantId: Id<"restaurants">;
  restaurantName: string;
}

export const cartItemsAtom = atomWithStorage<CartItem[]>("cart-items", []);

export const cartRestaurantIdAtom = atom<Id<"restaurants"> | null>((get) => {
  const items = get(cartItemsAtom);
  return items.length > 0 ? items[0]!.restaurantId : null;
});

export const cartSubtotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export const cartTotalDiscountsAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce(
    (sum, item) => sum + (item.price - item.discountedPrice) * item.quantity,
    0
  );
});

export const cartDeliveryFeeAtom = atomWithStorage<number>(
  "cart-delivery-fee",
  0
);

export const cartTotalAtom = atom((get) => {
  const subtotal = get(cartSubtotalAtom);
  const discounts = get(cartTotalDiscountsAtom);
  const deliveryFee = get(cartDeliveryFeeAtom);
  return subtotal - discounts + deliveryFee;
});
