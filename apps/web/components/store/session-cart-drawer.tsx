"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useSessionCart } from "@/hooks/use-session-cart";
import { formatCurrency } from "@/lib/format";
import Image from "next/image";

interface SessionCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderSent?: () => void;
}

export function SessionCartDrawer({ open, onOpenChange, onOrderSent }: SessionCartDrawerProps) {
  const router = useRouter();
  const orderContext = useAtomValue(orderContextAtom);
  const sessionId = orderContext.type === "dine_in" ? orderContext.sessionId : null;
  const { items, clearCart, totalItems } = useSessionCart(sessionId);
  const createOrder = useMutation(api.orders.createOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const handleCheckout = async () => {
    if (orderContext.type !== "dine_in" || items.length === 0) return;

    setIsSubmitting(true);
    try {
      await createOrder({
        restaurantId: orderContext.restaurantId,
        tableId: orderContext.tableId,
        sessionId: orderContext.sessionId,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          modifiers: i.modifiers,
        })),
      });
      await clearCart();
      onOpenChange(false);
      onOrderSent?.();
      router.push(`/menu/${orderContext.restaurantId}/orders?table=${orderContext.tableNumber}`);
    } catch {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableNumber =
    orderContext.type === "dine_in" ? orderContext.tableNumber : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Mesa {tableNumber}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-16 w-16" />
            <p>Nenhum item adicionado ainda</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCart()}
                className="text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Limpar
              </Button>
            </div>

            <Separator />

            <ScrollArea className="flex-1">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.menuItem?.imageUrl ? (
                        <Image
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem?.name ?? "Item"}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-muted-foreground/30">
                          {item.menuItem?.name?.charAt(0) ?? "?"}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.menuItem?.name ?? "Item indisponivel"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>

                    <span className="text-sm font-medium shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-2 py-4 text-sm">
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Pedido"}
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
