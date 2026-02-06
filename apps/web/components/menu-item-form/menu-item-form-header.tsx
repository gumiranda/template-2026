"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useMenuItemFormContext } from "./context";

const STATUS_OPTIONS = {
  active: { label: "Active", variant: "default" as const },
  inactive: { label: "Inactive", variant: "secondary" as const },
};

export function MenuItemFormHeader() {
  const { restaurantId, existingItemName, isActive, setIsActive } =
    useMenuItemFormContext();

  const isEditing = !!existingItemName;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/tenants/${restaurantId}/menu`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? `Edit Item: ${existingItemName}` : "New Item"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update the details of this menu item"
              : "Add a new item to your menu"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={STATUS_OPTIONS[isActive ? "active" : "inactive"].variant}>
          {STATUS_OPTIONS[isActive ? "active" : "inactive"].label}
        </Badge>
        <Select
          value={isActive ? "active" : "inactive"}
          onValueChange={(v) => setIsActive(v === "active")}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
