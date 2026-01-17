"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { ReactNode } from "react";

interface HintProps {
  children: ReactNode;
  text: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "end" | "center";
}

export function Hint({
  children,
  text,
  side = "top",
  align = "center",
}: HintProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
