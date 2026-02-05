"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { v4 as uuidv4 } from "uuid";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ShoppingCart, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { MenuItemSelector } from "./menu-item-selector";

interface TableCartDialogProps {
  tableId: Id<"tables"> | null;
  restaurantId: Id<"restaurants">;
  tableNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableCartDialog({
  tableId,
  restaurantId,
  tableNumber,
  open,
  onOpenChange,
}: TableCartDialogProps) {
  const cart = useQuery(
    api.carts.getCart,
    tableId ? { tableId } : "skip"
  );
  const addToCart = useMutation(api.carts.addToCart);
  const clearCart = useMutation(api.carts.clearCart);
  const createSession = useMutation(api.sessions.createSession);
  const createOrder = useMutation(api.orders.createOrder);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const cartSummary = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, totalItems: 0 };

    let subtotal = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      const price = item.menuItem?.price ?? item.price;
      const discount = item.menuItem?.discountPercentage ?? 0;
      const discountedPrice = price * (1 - discount / 100);
      subtotal += discountedPrice * item.quantity;
      totalItems += item.quantity;
    }

    return { subtotal, totalItems };
  }, [cart?.items]);

  const handleAddItem = async (menuItemId: Id<"menuItems">, quantity: number) => {
    if (!tableId) return;

    setIsAddingItem(true);
    try {
      await addToCart({
        tableId,
        restaurantId,
        menuItemId,
        quantity,
      });
      toast.success("Item adicionado ao carrinho");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao adicionar item"
      );
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleClearCart = async () => {
    if (!tableId) return;

    setIsClearingCart(true);
    try {
      await clearCart({ tableId });
      toast.success("Carrinho limpo");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao limpar carrinho"
      );
    } finally {
      setIsClearingCart(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!tableId || !cart?.items?.length) return;

    setIsCreatingOrder(true);
    try {
      // 1. Generate session ID and create in database
      const staffSessionId = uuidv4();
      await createSession({
        sessionId: staffSessionId,
        restaurantId,
        tableId,
      });

      // 2. Create order with cart items
      const items = cart.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      }));

      await createOrder({
        sessionId: staffSessionId,
        tableId,
        restaurantId,
        items,
      });

      // 3. Clear cart
      await clearCart({ tableId });

      toast.success("Pedido criado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao criar pedido"
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const hasItems = cart?.items && cart.items.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mesa #{tableNumber} - Carrinho
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Current Cart Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Itens no carrinho
            </h3>

            {cart === undefined ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !hasItems ? (
              <div className="text-center py-8 text-muted-foreground text-sm border rounded-md">
                Carrinho vazio
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                {cart.items.map((item) => {
                  const price = item.menuItem?.price ?? item.price;
                  const discount = item.menuItem?.discountPercentage ?? 0;
                  const discountedPrice = price * (1 - discount / 100);
                  const totalPrice = discountedPrice * item.quantity;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">
                          {item.quantity}x
                        </span>{" "}
                        <span className="font-medium truncate">
                          {item.menuItem?.name ?? "Item removido"}
                        </span>
                      </div>
                      <span className="font-medium ml-2">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {hasItems && (
              <>
                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total de itens
                    </span>
                    <span>{cartSummary.totalItems}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartSummary.subtotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isClearingCart || isCreatingOrder}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Menu Item Selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Adicionar itens</h3>
            {tableId && (
              <MenuItemSelector
                restaurantId={restaurantId}
                onAddItem={handleAddItem}
                isAddingItem={isAddingItem}
              />
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={!hasItems || isCreatingOrder}
          >
            {isCreatingOrder ? "Criando..." : "Criar Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
