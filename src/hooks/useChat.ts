"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface UseConvexChatOptions {
  reportId: Id<"reports">;
}

export function useConvexChat({ reportId }: UseConvexChatOptions) {
  const [isThinking, setIsThinking] = useState(false);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const saveUserMessage = useMutation(api.chat.saveUserMessage);
  const deleteMessagesFrom = useMutation(api.chat.deleteMessagesFrom);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      setIsThinking(true);
      setThoughts([]);
      scrollToBottom();

      try {
        // Save user message to Convex (appears immediately via subscription)
        await saveUserMessage({
          reportId,
          content: trimmed,
        });

        scrollToBottom();

        // Open SSE connection to streaming endpoint
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, message: trimmed }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);

            if (payload === "[DONE]") continue;

            try {
              const data = JSON.parse(payload) as {
                type: string;
                thought?: string;
                answer?: string;
                message?: string;
              };

              if (data.type === "thought" && data.thought) {
                setThoughts((prev) => [...prev, data.thought!]);
                scrollToBottom();
              } else if (data.type === "answer") {
                // Answer is saved to Convex by the API route;
                // it will appear via the Convex subscription
              } else if (data.type === "error") {
                console.error("[useConvexChat] Stream error:", data.message);
              }
            } catch {
              // Ignore unparseable lines
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // Stream was cancelled, ignore
        } else {
          console.error("[useConvexChat] Error:", error);
        }
      } finally {
        setIsThinking(false);
        setThoughts([]);
        abortRef.current = null;
        scrollToBottom();
      }
    },
    [isThinking, reportId, saveUserMessage, scrollToBottom],
  );

  const editMessage = useCallback(
    async (messageTimestamp: number, newText: string) => {
      if (isThinking) return;
      // Delete the edited message and everything after it
      await deleteMessagesFrom({ reportId, timestamp: messageTimestamp });
      // Resend with the new text (saves + streams like normal)
      await sendMessage(newText);
    },
    [isThinking, reportId, deleteMessagesFrom, sendMessage],
  );

  return { isThinking, thoughts, sendMessage, editMessage, messagesEndRef };
}
