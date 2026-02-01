"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Menu } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { NavItem } from "@/hooks/use-navigation";

interface MobileNavProps {
  currentUser: { name?: string } | null | undefined;
  adminItems: NavItem[];
  isActive: (href: string) => boolean;
}

export function MobileNav({ currentUser, adminItems, isActive }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[280px] max-w-[280px]">
        <DrawerTitle className="sr-only">Navigation menu</DrawerTitle>
        <DrawerHeader className="border-b">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <span className="text-xl font-bold">Restaurantix</span>
          </Link>
        </DrawerHeader>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            {adminItems
              .filter((item) => item.show)
              .map((item) => (
                <DrawerClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                        {item.badge > 9 ? "9+" : item.badge}
                      </Badge>
                    )}
                  </Link>
                </DrawerClose>
              ))}
          </div>
        </nav>

        <DrawerFooter className="border-t">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="truncate text-sm font-medium">
              {currentUser?.name || "User"}
            </span>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
