"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { ShoppingCart, Trash2, CheckCircle2, Bell } from "lucide-react";
import { toast } from "sonner";
import { RestaurantId } from "@/types/convex";

interface CartDrawerProps {
  restaurantId: RestaurantId;
  tableId: string;
  sessionId: string;
}

export function CartDrawer({
  restaurantId,
  tableId,
  sessionId,
}: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sessionCart = useQuery(api.sessions.getSessionCart, { sessionId });
  const generalCart = useQuery(api.carts.getCart, { tableId: tableId as any });
  const createOrder = useMutation(api.orders.createOrder);
  const clearSessionCart = useMutation(api.sessions.clearSessionCart);
  const clearGeneralCart = useMutation(api.carts.clearCart);

  const sessionCartTotal = sessionCart?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) || 0;

  const generalCartTotal = generalCart?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) || 0;

  const handleCallWaiter = async () => {
    if (!sessionCart || sessionCart.length === 0) {
      toast.error("Session cart is empty");
      return;
    }

    const orderItems = sessionCart.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.menuItem?.name || "",
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity,
    }));

    await createOrder({
      restaurantId,
      tableId: tableId as any,
      sessionId,
      items: orderItems,
    });

    await clearSessionCart({ sessionId });

    toast.success("Order sent to waiter!");

    setIsOpen(false);
  };

  const handleCloseBill = async () => {
    if (!generalCart || !generalCart.items || generalCart.items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    toast.success("Bill requested! Waiter will be with you soon.");

    await clearGeneralCart({ tableId: tableId as any });

    setIsOpen(false);
  };

  const totalItems =
    (sessionCart?.length || 0) + (generalCart?.items?.length || 0);

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
                {sessionCart.map((item) => (
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
                {generalCart.items.map((item) => (
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
              <span>R$ {(sessionCartTotal + generalCartTotal).toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCallWaiter}
                disabled={!sessionCart || sessionCart.length === 0}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                Chamar Garçom
              </Button>

              <Button
                onClick={handleCloseBill}
                disabled={!generalCart || !generalCart.items || generalCart.items.length === 0}
                variant="outline"
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Fechar Conta
              </Button>
            </div>

            <Button
              onClick={() => {
                clearSessionCart({ sessionId });
                toast.success("Session cart cleared");
              }}
              variant="destructive"
              className="w-full"
              disabled={!sessionCart || sessionCart.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Session Cart
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
