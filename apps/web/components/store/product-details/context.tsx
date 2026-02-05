"use client";

import {
  createContext,
  use,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useAtomValue } from "jotai";
import { orderContextAtom } from "@/lib/atoms/order-context";
import { useCart } from "@/hooks/use-cart";
import { useSessionCart } from "@/hooks/use-session-cart";
import { toast } from "sonner";
import type { Id } from "@workspace/backend/_generated/dataModel";
import type { SelectedModifier } from "@/lib/atoms/cart";

interface ModifierOption {
  _id: Id<"modifierOptions">;
  name: string;
  price: number;
}

interface ModifierGroup {
  _id: Id<"modifierGroups">;
  name: string;
  required: boolean;
  order: number;
  options: ModifierOption[];
}

export interface ProductData {
  _id: Id<"menuItems">;
  name: string;
  description?: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  imageUrl: string | null;
  restaurantId: Id<"restaurants">;
  tags: string[];
  modifierGroups: ModifierGroup[];
  restaurant: {
    _id: Id<"restaurants">;
    name: string;
    slug?: string | null;
    logoUrl: string | null;
    deliveryFee: number;
    deliveryTimeMinutes: number;
  };
}

// Map groupId -> selected optionId
type ModifierSelections = Record<string, string>;

interface ProductDetailsContextValue {
  // State
  product: ProductData;
  quantity: number;
  selections: ModifierSelections;
  selectedModifiers: SelectedModifier[];
  modifiersTotal: number;
  unitPrice: number;
  requiredGroupsMissing: boolean;

  // Actions
  setQuantity: (qty: number) => void;
  selectOption: (groupId: string, optionId: string) => void;
  handleAddToCart: () => Promise<void>;

  // Meta
  isDineIn: boolean;
}

const ProductDetailsContext = createContext<ProductDetailsContextValue | null>(
  null
);

export function useProductDetailsContext() {
  const context = use(ProductDetailsContext);
  if (!context) {
    throw new Error(
      "ProductDetails components must be used within ProductDetailsProvider"
    );
  }
  return context;
}

interface ProductDetailsProviderProps {
  product: ProductData;
  children: ReactNode;
}

export function ProductDetailsProvider({
  product,
  children,
}: ProductDetailsProviderProps) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<ModifierSelections>({});
  const orderContext = useAtomValue(orderContextAtom);
  const isDineIn = orderContext.type === "dine_in";

  // Hooks always called (rules of hooks)
  const { addToCart: addToDeliveryCart, setCartDeliveryFee } = useCart();
  const sessionCart = useSessionCart(isDineIn ? orderContext.sessionId : null);

  const selectOption = useCallback((groupId: string, optionId: string) => {
    setSelections((prev) => {
      // Toggle off if already selected
      if (prev[groupId] === optionId) {
        const next = { ...prev };
        delete next[groupId];
        return next;
      }
      return { ...prev, [groupId]: optionId };
    });
  }, []);

  const selectedModifiers = useMemo((): SelectedModifier[] => {
    const result: SelectedModifier[] = [];
    for (const group of product.modifierGroups) {
      const selectedOptionId = selections[group._id];
      if (!selectedOptionId) continue;
      const option = group.options.find((o) => o._id === selectedOptionId);
      if (option) {
        result.push({
          groupName: group.name,
          optionName: option.name,
          price: option.price,
        });
      }
    }
    return result;
  }, [product.modifierGroups, selections]);

  const modifiersTotal = useMemo(
    () => selectedModifiers.reduce((sum, m) => sum + m.price, 0),
    [selectedModifiers]
  );

  const unitPrice = product.discountedPrice + modifiersTotal;

  const requiredGroupsMissing = useMemo(() => {
    return product.modifierGroups
      .filter((g) => g.required)
      .some((g) => !selections[g._id]);
  }, [product.modifierGroups, selections]);

  const handleAddToCart = useCallback(async () => {
    if (isDineIn) {
      // Dine-in: use session cart (server-side)
      await sessionCart.addToCart(
        product._id,
        quantity,
        selectedModifiers.length > 0 ? selectedModifiers : undefined
      );
      toast.success("Adicionado ao pedido", {
        description: `${quantity}x ${product.name}`,
      });
    } else {
      // Delivery: use Jotai cart (client-side)
      addToDeliveryCart(
        {
          menuItemId: product._id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice,
          imageUrl: product.imageUrl,
          restaurantId: product.restaurantId,
          restaurantName: product.restaurant.name,
          selectedModifiers:
            selectedModifiers.length > 0 ? selectedModifiers : undefined,
        },
        quantity
      );
      setCartDeliveryFee(product.restaurant.deliveryFee);
      toast.success("Adicionado ao carrinho", {
        description: `${quantity}x ${product.name}`,
      });
    }
    setQuantity(1);
    setSelections({});
  }, [
    isDineIn,
    sessionCart,
    product,
    quantity,
    selectedModifiers,
    addToDeliveryCart,
    setCartDeliveryFee,
  ]);

  const value = useMemo<ProductDetailsContextValue>(
    () => ({
      product,
      quantity,
      selections,
      selectedModifiers,
      modifiersTotal,
      unitPrice,
      requiredGroupsMissing,
      setQuantity,
      selectOption,
      handleAddToCart,
      isDineIn,
    }),
    [
      product,
      quantity,
      selections,
      selectedModifiers,
      modifiersTotal,
      unitPrice,
      requiredGroupsMissing,
      selectOption,
      handleAddToCart,
      isDineIn,
    ]
  );

  return (
    <ProductDetailsContext value={value}>
      {children}
    </ProductDetailsContext>
  );
}
