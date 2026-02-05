"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Receipt, Bell } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useSessionCart } from "@/hooks/use-session-cart";
import { useSessionBill } from "@/hooks/use-session-bill";

interface DineInHeaderProps {
  onOpenCart: () => void;
  onOpenBill: () => void;
  onCallWaiter?: () => void;
}

export function DineInHeader({
  onOpenCart,
  onOpenBill,
  onCallWaiter,
}: DineInHeaderProps) {
  const orderContext = useAtomValue(orderContextAtom);
  const sessionId = orderContext.type === "dine_in" ? orderContext.sessionId : null;
  const tableNumber = orderContext.type === "dine_in" ? orderContext.tableNumber : "";

  const { totalItems: cartItemCount } = useSessionCart(sessionId);
  const { itemCount: billItemCount } = useSessionBill(sessionId);

  const [showPulse, setShowPulse] = useState(false);
  const prevCartCount = useRef(0);

  useEffect(() => {
    if (cartItemCount > prevCartCount.current) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 1000);
      prevCartCount.current = cartItemCount;
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cartItemCount;
  }, [cartItemCount]);

  if (orderContext.type !== "dine_in") return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b bg-background shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold text-primary">Mesa {tableNumber}</h2>

        <div className="flex items-center gap-1">
          {onCallWaiter && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCallWaiter}
                  className="text-amber-500"
                  aria-label="Chamar Garçom"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chamar Garçom</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={onOpenCart}
              >
                <ShoppingCart className="h-5 w-5 text-primary" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.div
                      key="cart-badge"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute -right-2 -top-2"
                    >
                      <Badge className="h-5 min-w-5 justify-center px-1 text-xs">
                        {cartItemCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showPulse && (
                    <motion.div
                      key="pulse"
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 rounded-full bg-primary/40"
                    />
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Carrinho de Pedidos</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={onOpenBill}
              >
                <Receipt className="h-5 w-5 text-muted-foreground" />
                <AnimatePresence>
                  {billItemCount > 0 && (
                    <motion.div
                      key="bill-badge"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute -right-2 -top-2"
                    >
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 justify-center px-1 text-xs"
                      >
                        {billItemCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Conta Total</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
