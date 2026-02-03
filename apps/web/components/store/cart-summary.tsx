"use client";

import { useAtomValue } from "jotai";
import {
  cartSubtotalAtom,
  cartTotalDiscountsAtom,
  cartDeliveryFeeAtom,
  cartTotalAtom,
} from "@/lib/atoms/cart";
import { formatCurrency } from "@/lib/format";

export function CartSummary() {
  const subtotal = useAtomValue(cartSubtotalAtom);
  const discounts = useAtomValue(cartTotalDiscountsAtom);
  const deliveryFee = useAtomValue(cartDeliveryFeeAtom);
  const total = useAtomValue(cartTotalAtom);

  return (
    <div className="space-y-2 py-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {discounts > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Descontos</span>
          <span>-{formatCurrency(discounts)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Entrega</span>
        <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : "Grátis"}</span>
      </div>
      <div className="flex justify-between font-semibold text-base pt-2 border-t">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
