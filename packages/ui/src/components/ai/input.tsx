"use client";

import type React from "react";
import { Loader2Icon, SendIcon, SquareIcon, XIcon } from "lucide-react";
import type {
  ComponentProps,
  HTMLAttributes,
  KeyboardEventHandler,
} from "react";
import { Children, useCallback, useEffect, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

type UseAutoResizeTextareaProps = {
  minHeight: number;
  maxHeight?: number;
};

const useAutoResizeTextarea = ({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
};

export type AIInputProps = HTMLAttributes<HTMLFormElement>;

export const AIInput = ({ className, ...props }: AIInputProps) => (
  <form
    className={cn(
      "w-full divide-y overflow-hidden rounded-md border bg-background",
      className
    )}
    {...props}
  />
);

export type AIInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

export const AIInputTextarea = ({
  onChange,
  className,
  placeholder = "What would you like to know?",
  minHeight = 48,
  maxHeight = 164,
  ...props
}: AIInputTextareaProps) => {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    },
    [adjustHeight, onChange]
  );

  return (
    <Textarea
      className={cn(
        "!text-sm",
        "w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0",
        "bg-transparent dark:bg-transparent",
        "focus-visible:ring-0",
        className
      )}
      name="message"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      ref={textareaRef}
      {...props}
    />
  );
};

export type AIInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const AIInputToolbar = ({
  className,
  ...props
}: AIInputToolbarProps) => (
  <div
    className={cn("flex items-center justify-between p-1", className)}
    {...props}
  />
);

export type AIInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const AIInputTools = ({ className, ...props }: AIInputToolsProps) => (
  <div
    className={cn(
      "flex items-center gap-1",
      "[&_button:first-child]:rounded-bl-xl",
      className
    )}
    {...props}
  />
);

export type AIInputButtonProps = ComponentProps<typeof Button>;

export const AIInputButton = ({
  variant = "ghost",
  className,
  size,
  ...props
}: AIInputButtonProps) => {
  const newSize =
    size ?? (Children.count(props.children) > 1 ? "default" : "icon");

  return (
    <Button
      className={cn(
        "shrink-0 gap-1.5 rounded-lg",
        variant === "ghost" && "text-muted-foreground",
        newSize === "default" && "px-3",
        className
      )}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};

export type AIInputSubmitProps = ComponentProps<typeof Button> & {
  status?: "submitted" | "streaming" | "ready" | "error";
};

export const AIInputSubmit = ({
  className,
  variant = "default",
  size = "icon",
  status,
  children,
  ...props
}: AIInputSubmitProps) => {
  let Icon = <SendIcon />;

  if (status === "submitted") {
    Icon = <Loader2Icon className="animate-spin" />;
  } else if (status === "streaming") {
    Icon = <SquareIcon />;
  } else if (status === "error") {
    Icon = <XIcon />;
  }

  return (
    <Button
      className={cn("gap-1.5 rounded-md rounded-br-lg", className)}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  );
};
