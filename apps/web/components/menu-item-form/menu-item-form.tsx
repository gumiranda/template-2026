"use client";

import { Loader2 } from "lucide-react";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { MenuItemFormProvider, useMenuItemFormLoading } from "./context";
import { MenuItemFormHeader } from "./menu-item-form-header";
import { DishPhotoCard } from "./dish-photo-card";
import { DietaryTagsCard } from "./dietary-tags-card";
import { BasicInfoSection } from "./basic-info-section";
import { ModifiersSection } from "./modifiers-section";
import { MenuItemFormFooter } from "./menu-item-form-footer";

interface MenuItemFormProps {
  restaurantId: Id<"restaurants">;
  itemId?: Id<"menuItems">;
}

export function MenuItemForm({ restaurantId, itemId }: MenuItemFormProps) {
  const { isLoading, notFound } = useMenuItemFormLoading(restaurantId, itemId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Item not found
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-medium">Item not found</h3>
        <p className="text-muted-foreground text-sm">
          The menu item you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <MenuItemFormProvider restaurantId={restaurantId} itemId={itemId}>
      <MenuItemFormContent />
    </MenuItemFormProvider>
  );
}

function MenuItemFormContent() {
  return (
    <div className="space-y-6">
      <MenuItemFormHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 1/3 */}
        <div className="space-y-6">
          <DishPhotoCard />
          <DietaryTagsCard />
        </div>

        {/* Right column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <BasicInfoSection />
          <ModifiersSection />
        </div>
      </div>

      <MenuItemFormFooter />
    </div>
  );
}
