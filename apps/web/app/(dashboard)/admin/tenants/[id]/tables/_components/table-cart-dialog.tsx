"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { v4 as uuidv4 } from "uuid";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Search,
  UtensilsCrossed,
  ShoppingBag,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { formatCurrency } from "@/lib/format";

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
  const cart = useQuery(api.carts.getCart, tableId ? { tableId } : "skip");
  const menu = useQuery(api.menu.getMenuByRestaurant, { restaurantId });

  const addToCart = useMutation(api.carts.addToCart);
  const clearCart = useMutation(api.carts.clearCart);
  const createSession = useMutation(api.sessions.createSession);
  const createOrder = useMutation(api.orders.createOrder);

  const [activeTab, setActiveTab] = useState<"menu" | "cart">("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Filter menu items
  const filteredMenu = useMemo(() => {
    if (!menu) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return menu.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.isActive),
      })).filter((cat) => cat.items.length > 0);
    }
    return menu
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.isActive &&
            (item.name.toLowerCase().includes(query) ||
              item.description?.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [menu, searchQuery]);

  // Calculate cart summary
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

  const handleAddItem = useCallback(
    async (menuItemId: Id<"menuItems">, quantity: number = 1) => {
      if (!tableId) return;
      setAddingItemId(menuItemId);
      try {
        await addToCart({ tableId, restaurantId, menuItemId, quantity });
        // Switch to cart tab and show success
        if (activeTab === "menu") {
          setActiveTab("cart");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Falha ao adicionar item"
        );
      } finally {
        setAddingItemId(null);
      }
    },
    [tableId, restaurantId, addToCart, activeTab]
  );

  const handleUpdateQuantity = useCallback(
    async (menuItemId: Id<"menuItems">, currentQty: number, delta: number) => {
      if (!tableId) return;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        // Remove item
        setRemovingItemId(menuItemId);
        try {
          await addToCart({ tableId, restaurantId, menuItemId, quantity: -currentQty });
        } catch (error) {
          toast.error("Falha ao remover item");
        } finally {
          setRemovingItemId(null);
        }
      } else {
        setAddingItemId(menuItemId);
        try {
          await addToCart({ tableId, restaurantId, menuItemId, quantity: delta });
        } catch (error) {
          toast.error("Falha ao atualizar quantidade");
        } finally {
          setAddingItemId(null);
        }
      }
    },
    [tableId, restaurantId, addToCart]
  );

  const handleClearCart = useCallback(async () => {
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
  }, [tableId, clearCart]);

  const handleCreateOrder = useCallback(async () => {
    if (!tableId || !cart?.items?.length) return;
    setIsCreatingOrder(true);
    try {
      const staffSessionId = uuidv4();
      await createSession({ sessionId: staffSessionId, restaurantId, tableId });
      const items = cart.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      }));
      await createOrder({ sessionId: staffSessionId, tableId, restaurantId, items });
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
  }, [tableId, cart?.items, restaurantId, createSession, createOrder, clearCart, onOpenChange]);

  const hasItems = cart?.items && cart.items.length > 0;
  const isLoading = cart === undefined || menu === undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg">Mesa #{tableNumber}</span>
              <p className="text-sm font-normal text-muted-foreground">
                Adicione itens ao pedido
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "menu" | "cart")}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tab Navigation */}
            <div className="px-6 py-2 border-b shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="menu" className="gap-2">
                  <Search className="h-4 w-4" />
                  Cardápio
                </TabsTrigger>
                <TabsTrigger value="cart" className="gap-2 relative">
                  <ShoppingCart className="h-4 w-4" />
                  Carrinho
                  {cartSummary.totalItems > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {cartSummary.totalItems}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Menu Tab */}
            <TabsContent value="menu" className="flex-1 flex flex-col m-0 min-h-0">
              {/* Search */}
              <div className="px-6 py-3 border-b shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar no cardápio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {filteredMenu.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhum item encontrado</p>
                    </div>
                  ) : (
                    filteredMenu.map((category) => (
                      <div key={category._id}>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {category.name}
                        </h3>
                        <div className="grid gap-2">
                          {category.items.map((item) => {
                            const hasDiscount =
                              item.discountPercentage && item.discountPercentage > 0;
                            const discountedPrice = hasDiscount
                              ? item.price * (1 - (item.discountPercentage ?? 0) / 100)
                              : item.price;
                            const isAdding = addingItemId === item._id;
                            const cartItem = cart?.items?.find(
                              (ci) => ci.menuItemId === item._id
                            );

                            return (
                              <div
                                key={item._id}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
                                  isAdding && "ring-2 ring-primary/20"
                                )}
                              >
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={56}
                                    height={56}
                                    className="rounded-lg object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground shrink-0">
                                    {item.name.charAt(0)}
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {hasDiscount ? (
                                      <>
                                        <span className="text-sm font-semibold text-green-600">
                                          {formatCurrency(discountedPrice)}
                                        </span>
                                        <span className="text-xs line-through text-muted-foreground">
                                          {formatCurrency(item.price)}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                          -{item.discountPercentage}%
                                        </Badge>
                                      </>
                                    ) : (
                                      <span className="text-sm font-semibold">
                                        {formatCurrency(item.price)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {cartItem ? (
                                  <div className="flex items-center gap-1 bg-primary/10 rounded-full p-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-primary/20"
                                      onClick={() =>
                                        handleUpdateQuantity(item._id, cartItem.quantity, -1)
                                      }
                                      disabled={isAdding || removingItemId === item._id}
                                    >
                                      {cartItem.quantity === 1 ? (
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      ) : (
                                        <Minus className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <span className="w-8 text-center font-semibold text-sm">
                                      {cartItem.quantity}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-primary/20"
                                      onClick={() =>
                                        handleUpdateQuantity(item._id, cartItem.quantity, 1)
                                      }
                                      disabled={isAdding}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="shrink-0 gap-1"
                                    onClick={() => handleAddItem(item._id)}
                                    disabled={isAdding}
                                  >
                                    {isAdding ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Plus className="h-4 w-4" />
                                        Adicionar
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Cart Tab */}
            <TabsContent value="cart" className="flex-1 flex flex-col m-0 min-h-0">
              {!hasItems ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
                  <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Carrinho vazio</p>
                  <p className="text-sm">Adicione itens do cardápio</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("menu")}
                  >
                    Ver cardápio
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-3">
                      {cart.items.map((item) => {
                        const price = item.menuItem?.price ?? item.price;
                        const discount = item.menuItem?.discountPercentage ?? 0;
                        const discountedPrice = price * (1 - discount / 100);
                        const totalPrice = discountedPrice * item.quantity;
                        const isUpdating = addingItemId === item.menuItemId;
                        const isRemoving = removingItemId === item.menuItemId;

                        return (
                          <div
                            key={item._id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
                              (isUpdating || isRemoving) && "opacity-60"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {item.menuItem?.name ?? "Item removido"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(discountedPrice)} cada
                              </p>
                            </div>

                            <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() =>
                                  handleUpdateQuantity(item.menuItemId, item.quantity, -1)
                                }
                                disabled={isUpdating || isRemoving}
                              >
                                {item.quantity === 1 ? (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                ) : (
                                  <Minus className="h-4 w-4" />
                                )}
                              </Button>
                              <span className="w-8 text-center font-semibold text-sm">
                                {isRemoving ? (
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() =>
                                  handleUpdateQuantity(item.menuItemId, item.quantity, 1)
                                }
                                disabled={isUpdating || isRemoving}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="w-20 text-right">
                              <p className="font-semibold">{formatCurrency(totalPrice)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Cart Summary */}
                  <div className="border-t px-6 py-4 space-y-3 shrink-0 bg-muted/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {cartSummary.totalItems} {cartSummary.totalItems === 1 ? "item" : "itens"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-destructive hover:text-destructive"
                        onClick={handleClearCart}
                        disabled={isClearingCart}
                      >
                        {isClearingCart ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Limpar tudo
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(cartSummary.subtotal)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <div className="border-t px-6 py-4 shrink-0 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleCreateOrder}
            disabled={!hasItems || isCreatingOrder}
          >
            {isCreatingOrder ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Criar Pedido
                {hasItems && (
                  <span className="opacity-70">
                    ({formatCurrency(cartSummary.subtotal)})
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
