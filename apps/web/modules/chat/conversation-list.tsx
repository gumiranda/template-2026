"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationListProps {
  selectedId?: Id<"conversations">;
  onSelect: (id: Id<"conversations">) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const conversations = useQuery(api.conversations.list);

  if (conversations === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          Nenhuma conversa ainda. Inicie uma nova conversa!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {conversations.map((conversation) => {
          if (!conversation) return null;
          const isSelected = selectedId === conversation._id;
          const initials = conversation.displayName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <button
              key={conversation._id}
              onClick={() => onSelect(conversation._id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors",
                isSelected && "bg-muted"
              )}
            >
              <Avatar>
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {conversation.displayName}
                  </span>
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {formatDistanceToNow(conversation.lastMessage.at, {
                        addSuffix: false,
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessage?.body ?? "Nenhuma mensagem"}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="ml-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs shrink-0"
                    >
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
