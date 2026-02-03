"use client";

import { useState } from "react";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { CartDrawer } from "@/components/store/cart-drawer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
