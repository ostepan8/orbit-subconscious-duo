"use client";

import { useEffect, useRef, useCallback } from "react";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  isHighlighted: boolean;
  onHighlightEnd: () => void;
  className?: string;
  tag?: "h1" | "h4" | "p" | "span" | "div";
  /** Key suffix to force remount on AI edits */
  version: number;
}

export default function EditableField({
  value,
  onChange,
  isHighlighted,
  onHighlightEnd,
  className = "",
  tag: Tag = "div",
  version,
}: EditableFieldProps) {
  const ref = useRef<HTMLElement>(null);
  const isUserEditing = useRef(false);

  // Sync value from AI edits (not user edits)
  useEffect(() => {
    if (ref.current && !isUserEditing.current) {
      ref.current.textContent = value;
    }
  }, [value, version]);

  // Auto-clear highlight after animation
  useEffect(() => {
    if (!isHighlighted) return;
    const timer = setTimeout(onHighlightEnd, 1500);
    return () => clearTimeout(timer);
  }, [isHighlighted, onHighlightEnd]);

  const handleFocus = useCallback(() => {
    isUserEditing.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isUserEditing.current = false;
    const text = ref.current?.textContent || "";
    if (text !== value) {
      onChange(text);
    }
  }, [onChange, value]);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`outline-none rounded-lg px-2 py-1 -mx-2 transition-all duration-200 focus:ring-2 focus:ring-brand-orange/20 focus:bg-white ${
        isHighlighted ? "animate-[highlightFlash_1.5s_ease-out]" : ""
      } ${className}`}
    >
      {value}
    </Tag>
  );
}
