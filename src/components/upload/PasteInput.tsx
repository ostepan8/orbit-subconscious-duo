"use client";

import { useRef, useState } from "react";

interface PasteInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  hideHeader?: boolean;
}

// ── HTML-to-text converter for messy clipboard data from Orbit ──

function htmlToCleanText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Remove non-content elements
  doc
    .querySelectorAll("style, script, link, meta, noscript")
    .forEach((el) => el.remove());

  // Convert tables to structured text (cell per line, blank line between rows)
  doc.querySelectorAll("table").forEach((table) => {
    const rows = Array.from(table.querySelectorAll("tr"));
    const textParts: string[] = [];

    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll("td, th"));
      const cellTexts = cells
        .map((c) => c.textContent?.trim() || "")
        .filter(Boolean);
      textParts.push(cellTexts.join("\n"));
    }

    const replacement = doc.createTextNode(
      "\n" + textParts.join("\n") + "\n",
    );
    table.replaceWith(replacement);
  });

  // Add newlines around block-level elements
  const blockSelector =
    "p, div, h1, h2, h3, h4, h5, h6, li, section, article, header, footer, blockquote, figcaption, details, summary";
  doc.querySelectorAll(blockSelector).forEach((el) => {
    el.insertAdjacentText("beforebegin", "\n");
    el.insertAdjacentText("afterend", "\n");
  });

  // Replace <br> with newlines
  doc.querySelectorAll("br").forEach((el) => {
    el.replaceWith(doc.createTextNode("\n"));
  });

  let text = doc.body.textContent || "";

  // Clean up whitespace
  text = text.replace(/\u00a0/g, " "); // &nbsp; → space
  text = text.replace(/\u200b/g, ""); // zero-width space
  text = text.replace(/\u200c/g, ""); // zero-width non-joiner
  text = text.replace(/\u200d/g, ""); // zero-width joiner
  text = text.replace(/\ufeff/g, ""); // BOM
  text = text.replace(/[ \t]+/g, " "); // collapse horizontal whitespace
  text = text.replace(/\n[ \t]+/g, "\n"); // trim leading whitespace per line
  text = text.replace(/[ \t]+\n/g, "\n"); // trim trailing whitespace per line
  text = text.replace(/\n{3,}/g, "\n\n"); // max 1 blank line
  text = text.trim();

  return text;
}

export default function PasteInput({ onSubmit, isLoading, hideHeader }: PasteInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      const cleanText = htmlToCleanText(html);

      // Insert at cursor position or replace selection
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newText = text.slice(0, start) + cleanText + text.slice(end);
      const cursorPos = start + cleanText.length;
      setText(newText);

      // Re-focus and restore cursor after React re-render
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
        }
      });
    }
    // If no HTML, default paste handles plain text fine
  };

  const handleSubmit = () => {
    if (text.trim().length < 20) return;
    onSubmit(text);
  };

  return (
    <div className={hideHeader ? "" : "animate-[slideUp_300ms_ease-out]"}>
      {!hideHeader && (
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-brand-black">
            Paste from Orbit
          </h3>
          <p className="mt-2 text-brand-gray">
            Paste your Orbit workbook output. Our AI agent will analyze it and
            populate the framework in real-time.
          </p>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder={
          "Paste directly from the Orbit website — HTML formatting will be cleaned automatically.\n\nStartup idea name is: ...\n1 - Market Segmentation: ...\n2 - Beachhead Market: ...\n..."
        }
        className="w-full h-32 rounded-2xl border border-brand-black/10 bg-brand-cream/30 p-4 text-sm text-brand-black placeholder:text-brand-gray/40 focus:border-brand-orange/40 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 resize-none transition-colors"
        disabled={isLoading}
      />

      <button
        onClick={handleSubmit}
        disabled={text.trim().length < 20 || isLoading}
        className="mt-4 w-full rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-orange/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? "Creating report..." : "Import & Let AI Process"}
      </button>
    </div>
  );
}
