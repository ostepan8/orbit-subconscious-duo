"use client";

import { useEffect } from "react";
import type { ChatMessage as ChatMessageType } from "@/types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatSidebarProps {
  messages: ChatMessageType[];
  isThinking: boolean;
  thoughts: string[];
  onSendMessage: (text: string) => void;
  onEditMessage?: (messageTimestamp: number, newText: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onImportClick?: () => void;
}

export default function ChatSidebar({
  messages,
  isThinking,
  thoughts,
  onSendMessage,
  onEditMessage,
  messagesEndRef,
  onImportClick,
}: ChatSidebarProps) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, thoughts, messagesEndRef]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-12 items-center gap-2 border-b border-brand-black/5 px-4">
        <div className="h-2 w-2 rounded-full bg-brand-teal" />
        <h3 className="text-sm font-semibold text-brand-black">AI Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onEdit={onEditMessage} isThinking={isThinking} />
        ))}

        {/* Thinking indicator with streaming thoughts */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-brand-cream/60 px-4 py-3 border border-brand-teal/10">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-brand-teal animate-pulse" />
                <span className="text-xs font-medium text-brand-teal">
                  Thinking...
                </span>
              </div>

              {/* Thoughts list */}
              {thoughts.length > 0 ? (
                <div className="space-y-1.5">
                  {thoughts.map((thought, i) => {
                    const isLatest = i === thoughts.length - 1;
                    return (
                      <div
                        key={i}
                        className="flex gap-2 animate-[fadeIn_300ms_ease-out]"
                      >
                        <span className="text-[10px] font-semibold text-brand-teal/60 mt-0.5 min-w-[16px]">
                          {i + 1}
                        </span>
                        <span
                          className={`text-xs leading-relaxed ${
                            isLatest
                              ? "text-brand-black"
                              : "text-brand-gray/60"
                          }`}
                        >
                          {thought}
                          {isLatest && (
                            <span className="inline-block ml-0.5 text-brand-teal animate-pulse">
                              &#9646;
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback: bouncing dots if no thoughts yet */
                <div className="flex items-center gap-1.5 pl-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-teal/40 animate-bounce [animation-delay:0ms]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-teal/40 animate-bounce [animation-delay:150ms]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-teal/40 animate-bounce [animation-delay:300ms]" />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isThinking} onImportClick={onImportClick} />
    </div>
  );
}
