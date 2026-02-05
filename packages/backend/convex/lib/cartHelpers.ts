import type { MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

/**
 * Validates that a menu item exists, is active, and belongs to the specified restaurant.
 * Returns the menu item if valid, throws an error otherwise.
 */
export async function validateMenuItemForCart(
  ctx: MutationCtx,
  menuItemId: Id<"menuItems">,
  restaurantId: Id<"restaurants">
): Promise<Doc<"menuItems">> {
  const menuItem = await ctx.db.get(menuItemId);
  if (!menuItem) {
    throw new Error("Menu item not found");
  }
  if (menuItem.restaurantId !== restaurantId) {
    throw new Error("Menu item does not belong to this restaurant");
  }
  if (!menuItem.isActive) {
    throw new Error("Menu item is not available");
  }
  return menuItem;
}
