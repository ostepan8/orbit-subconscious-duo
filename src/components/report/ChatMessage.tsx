"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit?: (messageTimestamp: number, newText: string) => void;
  isThinking?: boolean;
}

/** Extract "Final Answer:" block from AI response, fall back to full content */
function extractDisplay(content: string, isUser: boolean): string {
  if (isUser) return content;
  const match = content.match(/Final Answer:\s*\n?([\s\S]*)/i);
  return match ? match[1].trim() : content;
}

export default function ChatMessage({ message, onEdit, isThinking }: ChatMessageProps) {
  const isUser = message.role === "user";
  const displayText = extractDisplay(message.content, isUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed || !onEdit) return;
    setIsEditing(false);
    onEdit(message.timestamp.getTime(), trimmed);
  };

  const handleCancel = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Edit mode for user messages
  if (isUser && isEditing) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] w-full">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={Math.max(2, editText.split("\n").length)}
            className="w-full resize-none rounded-2xl rounded-br-md border-2 border-brand-orange/40 bg-brand-orange/5 px-4 py-3 text-sm leading-relaxed outline-none focus:border-brand-orange/60"
          />
          <div className="mt-1.5 flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg px-3 py-1 text-xs font-medium text-brand-gray hover:bg-brand-black/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editText.trim() || editText.trim() === message.content}
              className="rounded-lg bg-brand-orange px-3 py-1 text-xs font-medium text-white hover:bg-brand-orange/90 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Save &amp; Resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex animate-[slideUp_300ms_ease-out] ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Edit button — only on user messages, hidden during thinking */}
      {isUser && onEdit && !isThinking && (
        <button
          onClick={() => {
            setEditText(message.content);
            setIsEditing(true);
          }}
          className="mr-1.5 self-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Edit message"
        >
          <svg className="h-3.5 w-3.5 text-brand-gray/40 hover:text-brand-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "rounded-br-md bg-brand-orange text-white"
            : "rounded-bl-md bg-brand-cream text-brand-black"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayText}</p>
        <p
          className={`mt-1 text-[10px] ${isUser ? "text-white/50" : "text-brand-gray/50"}`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
