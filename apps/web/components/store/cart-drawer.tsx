"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { DrawerSheet } from "@/components/ui/drawer-sheet";

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
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const handleCheckout = async () => {
    if (!isSignedIn) {
      onOpenChange(false);
      router.push("/sign-in");
      return;
    }

    const firstItem = items[0];
    if (!firstItem) return;

    const trimmedAddress = deliveryAddress.trim();
    if (!trimmedAddress) {
      toast.error("Preencha o endereco de entrega.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        restaurantId: firstItem.restaurantId,
        deliveryAddress: trimmedAddress,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      setDeliveryAddress("");
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
    <DrawerSheet
      open={open}
      onOpenChange={onOpenChange}
      isEmpty={items.length === 0}
      icon={ShoppingBag}
      title="Carrinho"
    >
      <DrawerSheet.Content>
        <DrawerSheet.Header />

        <DrawerSheet.Empty>
          <p>Seu carrinho está vazio</p>
          <Button asChild variant="outline">
            <Link href="/restaurants" onClick={() => onOpenChange(false)}>
              Ver restaurantes
            </Link>
          </Button>
        </DrawerSheet.Empty>

        <DrawerSheet.InfoBar>
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
        </DrawerSheet.InfoBar>

        <DrawerSheet.Body>
          {items.map((item) => (
            <CartItem key={item.menuItemId} item={item} />
          ))}
        </DrawerSheet.Body>

        <DrawerSheet.Summary>
          <CartSummary />
        </DrawerSheet.Summary>

        <DrawerSheet.Extra>
          <div className="space-y-2">
            <Label htmlFor="delivery-address" className="text-sm font-medium">
              Endereco de entrega
            </Label>
            <Textarea
              id="delivery-address"
              placeholder="Rua, numero, bairro, complemento..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </DrawerSheet.Extra>

        <DrawerSheet.Action
          onClick={handleCheckout}
          disabled={isSubmitting || !deliveryAddress.trim()}
        >
          {isSubmitting ? "Enviando..." : "Finalizar Pedido"}
        </DrawerSheet.Action>
      </DrawerSheet.Content>
    </DrawerSheet>
  );
}
