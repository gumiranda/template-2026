"use client";

import { use } from "react";
import { Id } from "@workspace/backend/_generated/dataModel";
import { isValidConvexId } from "@workspace/backend/lib/helpers";
import { AdminGuard } from "@/components/admin-guard";
import { MenuItemForm } from "@/components/menu-item-form/menu-item-form";

export default function NewMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  if (!isValidConvexId(id)) {
    return (
      <AdminGuard>
        {() => (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium">Invalid restaurant ID</h3>
            <p className="text-muted-foreground">
              The provided ID format is not valid.
            </p>
          </div>
        )}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      {() => <MenuItemForm restaurantId={id as Id<"restaurants">} />}
    </AdminGuard>
  );
}
