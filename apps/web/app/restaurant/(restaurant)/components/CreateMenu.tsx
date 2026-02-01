"use client";

import { Id } from "@workspace/backend/_generated/dataModel";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Plus } from "lucide-react";
import MenuContent from "./MenuContent";

export default function CreateMenu({ id }: { id: Id<"restaurants"> }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Menu Configuration</DialogTitle>
          <DialogDescription>
            Manage your restaurant menu items and categories
          </DialogDescription>
        </DialogHeader>
        <MenuContent selectedRestaurantIdProps={id} />
      </DialogContent>
    </Dialog>
  );
}
