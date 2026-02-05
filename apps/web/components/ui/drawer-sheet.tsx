"use client";

import React, { use, createContext, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { LucideIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// Context
interface DrawerSheetContextValue {
  isEmpty: boolean;
  icon: LucideIcon;
  title: string;
}

const DrawerSheetContext = createContext<DrawerSheetContextValue | null>(null);

function useDrawerSheetContext() {
  const context = use(DrawerSheetContext);
  if (!context) {
    throw new Error(
      "DrawerSheet compound components must be used within DrawerSheet"
    );
  }
  return context;
}

// Root component
interface DrawerSheetRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEmpty: boolean;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

function DrawerSheetRoot({
  open,
  onOpenChange,
  isEmpty,
  icon,
  title,
  children,
}: DrawerSheetRootProps) {
  return (
    <DrawerSheetContext value={{ isEmpty, icon, title }}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        {children}
      </Sheet>
    </DrawerSheetContext>
  );
}

// Content wrapper
interface DrawerSheetContentProps {
  children: ReactNode;
  className?: string;
}

function DrawerSheetContent({ children, className }: DrawerSheetContentProps) {
  return (
    <SheetContent
      className={cn("flex w-full flex-col pb-4 sm:max-w-md", className)}
    >
      {children}
    </SheetContent>
  );
}

// Header with icon and title
interface DrawerSheetHeaderProps {
  className?: string;
  "aria-label"?: string;
}

function DrawerSheetHeader({
  className,
  "aria-label": ariaLabel,
}: DrawerSheetHeaderProps) {
  const { icon: Icon, title } = useDrawerSheetContext();
  return (
    <SheetHeader className={className} aria-label={ariaLabel}>
      <SheetTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </SheetTitle>
    </SheetHeader>
  );
}

// Empty state container - only renders when isEmpty
interface DrawerSheetEmptyProps {
  children: ReactNode;
  className?: string;
}

function DrawerSheetEmpty({ children, className }: DrawerSheetEmptyProps) {
  const { isEmpty, icon: Icon } = useDrawerSheetContext();
  if (!isEmpty) return null;
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-4 text-muted-foreground",
        className
      )}
    >
      <Icon className="h-16 w-16" />
      {children}
    </div>
  );
}

// Info bar (count + clear button area)
interface DrawerSheetInfoBarProps {
  children: ReactNode;
  className?: string;
}

function DrawerSheetInfoBar({ children, className }: DrawerSheetInfoBarProps) {
  const { isEmpty } = useDrawerSheetContext();
  if (isEmpty) return null;
  return (
    <>
      <div
        className={cn("flex items-center justify-between px-4 py-2", className)}
      >
        {children}
      </div>
      <Separator />
    </>
  );
}

// Scrollable body
interface DrawerSheetBodyProps {
  children: ReactNode;
  className?: string;
}

function DrawerSheetBody({ children, className }: DrawerSheetBodyProps) {
  const { isEmpty } = useDrawerSheetContext();
  if (isEmpty) return null;
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="space-y-4 px-4 py-4">{children}</div>
    </ScrollArea>
  );
}

// Summary section (totals)
interface DrawerSheetSummaryProps {
  children: ReactNode;
  className?: string;
}

function DrawerSheetSummary({ children, className }: DrawerSheetSummaryProps) {
  const { isEmpty } = useDrawerSheetContext();
  if (isEmpty) return null;
  return (
    <>
      <Separator />
      <div className={cn("space-y-2 px-4 py-4 text-sm", className)}>
        {children}
      </div>
    </>
  );
}

// Action button
interface DrawerSheetActionProps
  extends Omit<React.ComponentProps<typeof Button>, "size" | "className"> {
  children: ReactNode;
  className?: string;
}

function DrawerSheetAction({
  children,
  className,
  ...props
}: DrawerSheetActionProps) {
  const { isEmpty } = useDrawerSheetContext();
  if (isEmpty) return null;
  return (
    <div className="px-4">
      <Button className={cn("w-full", className)} size="lg" {...props}>
        {children}
      </Button>
    </div>
  );
}

// Extra content section (for forms, alerts, etc.) - renders before action button
interface DrawerSheetExtraProps {
  children: ReactNode;
  className?: string;
}

function DrawerSheetExtra({ children, className }: DrawerSheetExtraProps) {
  const { isEmpty } = useDrawerSheetContext();
  if (isEmpty) return null;
  return (
    <>
      <Separator />
      <div className={cn("px-4 py-2", className)}>{children}</div>
    </>
  );
}

// Compound component exports
export const DrawerSheet = Object.assign(DrawerSheetRoot, {
  Content: DrawerSheetContent,
  Header: DrawerSheetHeader,
  Empty: DrawerSheetEmpty,
  InfoBar: DrawerSheetInfoBar,
  Body: DrawerSheetBody,
  Summary: DrawerSheetSummary,
  Action: DrawerSheetAction,
  Extra: DrawerSheetExtra,
});

export { useDrawerSheetContext };
