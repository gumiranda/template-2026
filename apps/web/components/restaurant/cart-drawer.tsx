"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { ShoppingCart, Trash2, CheckCircle2, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@workspace/backend/_generated/dataModel";

interface CartDrawerProps {
  restaurantId: Id<"restaurants">;
  tableId: Id<"tables">;
  sessionId: string;
}

interface CartItem {
  _id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: { name: string };
}

function CartItemsList({ items }: { items: CartItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between py-2 border-b"
        >
          <div className="flex-1">
            <p className="font-medium">
              {item.menuItem?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Qty: {item.quantity} x R$ {item.price.toFixed(2)}
            </p>
          </div>
          <span className="font-bold">
            R$ {(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CartDrawer({
  restaurantId,
  tableId,
  sessionId,
}: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCallWaiterLoading, setIsCallWaiterLoading] = useState(false);
  const [isCloseBillLoading, setIsCloseBillLoading] = useState(false);
  const [isClearCartLoading, setIsClearCartLoading] = useState(false);

  const sessionCart = useQuery(api.sessions.getSessionCart, { sessionId });
  const generalCart = useQuery(api.carts.getCart, { tableId });
  const createOrder = useMutation(api.orders.createOrder);
  const clearSessionCart = useMutation(api.sessions.clearSessionCart);
  const clearGeneralCart = useMutation(api.carts.clearCart);

  const sessionCartTotal = useMemo(() =>
    sessionCart?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) || 0,
    [sessionCart]
  );

  const generalCartTotal = useMemo(() =>
    generalCart?.items?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) || 0,
    [generalCart?.items]
  );

  const totalBill = useMemo(() =>
    sessionCartTotal + generalCartTotal,
    [sessionCartTotal, generalCartTotal]
  );

  const handleCallWaiter = useCallback(async () => {
    if (!sessionCart || sessionCart.length === 0) {
      toast.error("Session cart is empty");
      return;
    }

    setIsCallWaiterLoading(true);
    try {
      const orderItems = sessionCart.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.menuItem?.name || "",
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      }));

      await createOrder({
        restaurantId,
        tableId,
        sessionId,
        items: orderItems,
      });

      await clearSessionCart({ sessionId });

      toast.success("Order sent to waiter!");
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send order");
    } finally {
      setIsCallWaiterLoading(false);
    }
  }, [sessionCart, restaurantId, tableId, sessionId, createOrder, clearSessionCart]);

  const handleCloseBill = useCallback(async () => {
    if (!generalCart || !generalCart.items || generalCart.items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsCloseBillLoading(true);
    try {
      await clearGeneralCart({ tableId });
      toast.success("Bill requested! Waiter will be with you soon.");
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to close bill");
    } finally {
      setIsCloseBillLoading(false);
    }
  }, [generalCart, tableId, clearGeneralCart]);

  const handleClearSessionCart = useCallback(async () => {
    setIsClearCartLoading(true);
    try {
      await clearSessionCart({ sessionId });
      toast.success("Session cart cleared");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clear cart");
    } finally {
      setIsClearCartLoading(false);
    }
  }, [sessionId, clearSessionCart]);

  const totalItems =
    (sessionCart?.length || 0) + (generalCart?.items?.length || 0);

  const isAnyLoading = isCallWaiterLoading || isCloseBillLoading || isClearCartLoading;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-4 right-4 shadow-lg gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
          {totalItems > 0 && (
            <Badge variant="secondary">{totalItems}</Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Your Orders</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Session Orders (Send to Waiter)</h3>
            </div>
            {sessionCart && sessionCart.length > 0 ? (
              <div className="space-y-3">
                <CartItemsList items={sessionCart as CartItem[]} />
                <div className="pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Session Total:</span>
                    <span>R$ {sessionCartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No items in session cart
              </p>
            )}
          </section>

          <Separator />

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">General Cart (For Bill)</h3>
            </div>
            {generalCart && generalCart.items && generalCart.items.length > 0 ? (
              <div className="space-y-3">
                <CartItemsList items={generalCart.items as CartItem[]} />
                <div className="pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>General Total:</span>
                    <span>R$ {generalCartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No items in general cart
              </p>
            )}
          </section>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between text-xl font-bold">
              <span>Total Bill:</span>
              <span>R$ {totalBill.toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCallWaiter}
                disabled={!sessionCart || sessionCart.length === 0 || isAnyLoading}
                className="flex-1"
              >
                {isCallWaiterLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                Chamar Garçom
              </Button>

              <Button
                onClick={handleCloseBill}
                disabled={!generalCart || !generalCart.items || generalCart.items.length === 0 || isAnyLoading}
                variant="outline"
                className="flex-1"
              >
                {isCloseBillLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Fechar Conta
              </Button>
            </div>

            <Button
              onClick={handleClearSessionCart}
              variant="destructive"
              className="w-full"
              disabled={!sessionCart || sessionCart.length === 0 || isAnyLoading}
            >
              {isClearCartLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Session Cart
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
