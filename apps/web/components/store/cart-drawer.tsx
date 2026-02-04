"use client";

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
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, clearCart } = useCart();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const createOrder = useMutation(api.customerOrders.createDeliveryOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      onOpenChange(false);
      router.push("/sign-in");
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      await createOrder({
        restaurantId: items[0]!.restaurantId,
        deliveryAddress: "Endereço a definir",
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      onOpenChange(false);
      toast.success("Pedido enviado com sucesso!");
      router.push("/my-orders");
    } catch {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-16 w-16" />
            <p>Seu carrinho está vazio</p>
            <Button asChild variant="outline">
              <Link href="/restaurants" onClick={() => onOpenChange(false)}>
                Ver restaurantes
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                {items[0]?.restaurantName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
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
                  <CartItem key={item.menuItemId} item={item} />
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <CartSummary />

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Finalizar Pedido"}
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
