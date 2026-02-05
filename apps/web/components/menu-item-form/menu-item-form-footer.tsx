"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useMenuItemFormContext } from "./context";

export function MenuItemFormFooter() {
  const { restaurantId, isSaving, isValid, handleSave } =
    useMenuItemFormContext();

  return (
    <div className="sticky bottom-0 z-10 border-t bg-background py-4">
      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href={`/admin/tenants/${restaurantId}/menu`}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={!isValid || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
