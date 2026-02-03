"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface MenuItemFormFooterProps {
  restaurantId: string;
  isSaving: boolean;
  isValid: boolean;
  onSave: () => void;
}

export function MenuItemFormFooter({
  restaurantId,
  isSaving,
  isValid,
  onSave,
}: MenuItemFormFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 border-t bg-background py-4">
      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href={`/admin/tenants/${restaurantId}/menu`}>Cancel</Link>
        </Button>
        <Button onClick={onSave} disabled={!isValid || isSaving}>
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
