"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { SessionCartDrawer } from "@/components/store/session-cart-drawer";
import { orderContextAtom } from "@/lib/atoms/order-context";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const orderContext = useAtomValue(orderContextAtom);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      {orderContext.type === "delivery" ? (
        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      ) : (
        <SessionCartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      )}
    </div>
  );
}
