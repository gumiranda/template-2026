"use client";

import { useState, useCallback } from "react";
import { useAtomValue } from "jotai";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { SessionCartDrawer } from "@/components/store/session-cart-drawer";
import { DineInHeader } from "@/components/store/dine-in-header";
import { BillDrawer } from "@/components/store/bill-drawer";
import { SessionClosedOverlay } from "@/components/store/session-closed-overlay";
import { StatusNotification } from "@/components/store/status-notification";
import { useStatusNotifications } from "@/hooks/use-status-notifications";
import { orderContextAtom } from "@/lib/atoms/order-context";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const orderContext = useAtomValue(orderContextAtom);
  const { notification, showWaiterStatus, showOrderStatus, hideNotification } =
    useStatusNotifications();

  const handleCallWaiter = useCallback(() => {
    showWaiterStatus();
  }, [showWaiterStatus]);

  const handleOrderSent = useCallback(() => {
    showOrderStatus();
  }, [showOrderStatus]);

  const isDineIn = orderContext.type === "dine_in";

  return (
    <div className="flex min-h-screen flex-col">
      {isDineIn ? (
        <DineInHeader
          onOpenCart={() => setCartOpen(true)}
          onOpenBill={() => setBillOpen(true)}
          onCallWaiter={handleCallWaiter}
        />
      ) : (
        <StoreHeader onOpenCart={() => setCartOpen(true)} />
      )}
      <main className={isDineIn ? "flex-1 pt-14" : "flex-1"}>{children}</main>
      {!isDineIn && <StoreFooter />}

      {isDineIn ? (
        <>
          <SessionCartDrawer
            open={cartOpen}
            onOpenChange={setCartOpen}
            onOrderSent={handleOrderSent}
          />
          <BillDrawer open={billOpen} onOpenChange={setBillOpen} />
          <SessionClosedOverlay />
          <StatusNotification
            type={notification.type}
            show={notification.show}
            onComplete={hideNotification}
          />
        </>
      ) : (
        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      )}
    </div>
  );
}
