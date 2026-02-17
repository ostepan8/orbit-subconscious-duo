"use client";

import { useState, useCallback } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  onImportClick?: () => void;
}

export default function ChatInput({ onSend, disabled, onImportClick }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="border-t border-brand-black/5 p-4">
      <div className="flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to refine the report..."
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-brand-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-brand-gray/40 focus:border-brand-orange/40 focus:ring-2 focus:ring-brand-orange/10 disabled:opacity-50"
        />
        {onImportClick && (
          <button
            onClick={onImportClick}
            disabled={disabled}
            title="Import Orbit Data"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-black/10 bg-white text-brand-gray transition-all hover:border-brand-orange/40 hover:text-brand-orange disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </button>
        )}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white transition-all hover:bg-brand-orange/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-[10px] text-brand-gray/40">
        Press Enter to send &bull; Shift+Enter for new line
      </p>
    </div>
  );
}
