"use client";

import { useState } from "react";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { MessageSquarePlus, ArrowLeft, MessageCircle } from "lucide-react";
import { ConversationList } from "@/modules/chat/conversation-list";
import { MessageArea } from "@/modules/chat/message-area";
import { MessageInput } from "@/modules/chat/message-input";
import { NewConversationDialog } from "@/modules/chat/new-conversation-dialog";
import { cn } from "@workspace/ui/lib/utils";

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Id<"conversations"> | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14)-theme(spacing.12))] -m-6 border rounded-lg overflow-hidden bg-background">
      {/* Sidebar - conversation list */}
      <div
        className={cn(
          "w-full md:w-80 md:min-w-80 flex flex-col border-r",
          selectedConversation && "hidden md:flex"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-lg">Chat</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNewDialog(true)}
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="sr-only">Nova conversa</span>
          </Button>
        </div>
        <Separator />
        <ConversationList
          selectedId={selectedConversation ?? undefined}
          onSelect={setSelectedConversation}
        />
      </div>

      {/* Main - message area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          !selectedConversation && "hidden md:flex"
        )}
      >
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-2 p-3 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Voltar</span>
              </Button>
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">Conversa</span>
            </div>
            <MessageArea conversationId={selectedConversation} />
            <MessageInput conversationId={selectedConversation} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <MessageCircle className="h-16 w-16 opacity-20" />
            <div className="text-center">
              <p className="font-medium">Selecione uma conversa</p>
              <p className="text-sm">
                Ou inicie uma nova conversa clicando no botão acima
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowNewDialog(true)}
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Nova conversa
            </Button>
          </div>
        )}
      </div>

      <NewConversationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onConversationCreated={(id) => setSelectedConversation(id)}
      />
    </div>
  );
}
