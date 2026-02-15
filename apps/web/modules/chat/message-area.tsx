"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageAreaProps {
  conversationId: Id<"conversations">;
}

export function MessageArea({ conversationId }: MessageAreaProps) {
  const messages = useQuery(api.messages.list, { conversationId });
  const markAsRead = useMutation(api.conversations.markAsRead);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsRead({ conversationId });
    }
  }, [conversationId, messages?.length, markAsRead]);

  if (messages === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">Carregando mensagens...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma mensagem ainda. Envie a primeira!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const initials = message.senderName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={message._id}
              className={cn(
                "flex gap-2 max-w-[85%]",
                message.isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {!message.isOwn && (
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "flex flex-col",
                  message.isOwn ? "items-end" : "items-start"
                )}
              >
                {!message.isOwn && (
                  <span className="text-xs text-muted-foreground mb-1">
                    {message.senderName}
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 text-sm break-words",
                    message.isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  {message.body}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {format(message._creationTime, "HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
