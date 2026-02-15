"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Search } from "lucide-react";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (id: Id<"conversations">) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const users = useQuery(api.conversations.getApprovedUsers);
  const createDirect = useMutation(api.conversations.createDirect);

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectUser = async (userId: Id<"users">) => {
    setLoading(userId);
    try {
      const conversationId = await createDirect({ userId });
      onConversationCreated(conversationId);
      onOpenChange(false);
      setSearch("");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
          <DialogDescription>
            Selecione um usuário para iniciar uma conversa.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className="max-h-[300px]">
          {filteredUsers === undefined ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-sm text-muted-foreground animate-pulse">
                Carregando...
              </span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-sm text-muted-foreground">
                Nenhum usuário encontrado.
              </span>
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <Button
                    key={user._id}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto py-3 rounded-none"
                    onClick={() => handleSelectUser(user._id)}
                    disabled={loading !== null}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                    {loading === user._id && (
                      <span className="ml-auto text-xs text-muted-foreground animate-pulse">
                        Criando...
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
