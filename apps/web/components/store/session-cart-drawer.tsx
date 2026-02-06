"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useSessionCart } from "@/hooks/use-session-cart";
import { formatCurrency } from "@/lib/format";
import { DrawerSheet } from "@/components/ui/drawer-sheet";

interface SessionCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderSent?: () => void;
}

export function SessionCartDrawer({
  open,
  onOpenChange,
  onOrderSent,
}: SessionCartDrawerProps) {
  const router = useRouter();
  const orderContext = useAtomValue(orderContextAtom);
  const sessionId =
    orderContext.type === "dine_in" ? orderContext.sessionId : null;
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
      router.push(
        `/menu/${orderContext.restaurantId}/orders?table=${orderContext.tableNumber}`
      );
    } catch {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableNumber =
    orderContext.type === "dine_in" ? orderContext.tableNumber : "";

  return (
    <DrawerSheet
      open={open}
      onOpenChange={onOpenChange}
      isEmpty={items.length === 0}
      icon={ShoppingBag}
      title={`Mesa ${tableNumber}`}
    >
      <DrawerSheet.Content>
        <DrawerSheet.Header />

        <DrawerSheet.Empty>
          <p>Nenhum item adicionado ainda</p>
        </DrawerSheet.Empty>

        <DrawerSheet.InfoBar>
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
        </DrawerSheet.InfoBar>

        <DrawerSheet.Body>
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-3">
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

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.menuItem?.name ?? "Item indisponivel"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.price)} x {item.quantity}
                </p>
              </div>

              <span className="shrink-0 text-sm font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </DrawerSheet.Body>

        <DrawerSheet.Summary>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </DrawerSheet.Summary>

        <DrawerSheet.Action onClick={handleCheckout} disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Pedido"}
        </DrawerSheet.Action>
      </DrawerSheet.Content>
    </DrawerSheet>
  );
}
