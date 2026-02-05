"use client";

import {
  ProductDetailsProvider,
  useProductDetailsContext,
  type ProductData,
} from "./context";
import { ProductDetailsImage } from "./image";
import { ProductDetailsInfo } from "./info";
import { ProductDetailsRestaurant } from "./restaurant";
import { ProductDetailsModifiers } from "./modifiers";
import { ProductDetailsQuantity } from "./quantity";
import { ProductDetailsAddButton } from "./add-button";

interface ProductDetailsProps {
  product: ProductData;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <ProductDetailsProvider product={product}>
      <ProductDetailsContent />
    </ProductDetailsProvider>
  );
}

function ProductDetailsContent() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ProductDetailsImage />

      <div className="space-y-6">
        <ProductDetailsInfo />
        <ProductDetailsRestaurant />
        <ProductDetailsModifiers />

        <div className="flex items-center gap-4">
          <ProductDetailsQuantity />
          <ProductDetailsAddButton />
        </div>
      </div>
    </div>
  );
}

// Export compound components for flexibility
ProductDetails.Image = ProductDetailsImage;
ProductDetails.Info = ProductDetailsInfo;
ProductDetails.Restaurant = ProductDetailsRestaurant;
ProductDetails.Modifiers = ProductDetailsModifiers;
ProductDetails.Quantity = ProductDetailsQuantity;
ProductDetails.AddButton = ProductDetailsAddButton;
ProductDetails.Provider = ProductDetailsProvider;

// Re-export types
export { type ProductData } from "./context";
export { useProductDetailsContext } from "./context";
