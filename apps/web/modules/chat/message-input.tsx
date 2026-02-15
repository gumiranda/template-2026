"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  conversationId: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [body, setBody] = useState("");
  const sendMessage = useMutation(api.messages.send);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    setBody("");
    await sendMessage({ conversationId, body: trimmed });
    inputRef.current?.focus();
  };

  return (
    <div className="border-t p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <Input
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!body.trim()}>
          <SendHorizontal className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
