"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import type { DEStep, DEStepContent, DEStepContentBlock } from "@/types/de-framework";
import type { Citation } from "@/types";
import Badge from "@/components/ui/Badge";

interface DEStepCardProps {
  step: DEStep;
  citations?: Citation[];
}

const statusConfig = {
  complete: { dot: "bg-brand-orange", badge: "orange" as const, label: "Complete" },
  in_progress: { dot: "bg-brand-teal", badge: "teal" as const, label: "In Progress" },
  not_started: { dot: "bg-brand-gray/30", badge: "gray" as const, label: "Not Started" },
};

// ── Cited Text — renders [N] as clickable citation links ────────────

const CITE_REF_RE = /\[(\d+)\]/g;

function CitedText({ text, citations }: { text: string; citations?: Citation[] }) {
  if (!citations || citations.length === 0 || !CITE_REF_RE.test(text)) {
    return <>{text}</>;
  }

  // Reset regex lastIndex after test
  CITE_REF_RE.lastIndex = 0;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CITE_REF_RE.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const refNum = parseInt(match[1], 10);
    const citation = citations[refNum - 1]; // citations are 0-indexed, refs are 1-indexed
    const url = citation?.url;

    if (url) {
      parts.push(
        <a
          key={`${match.index}-${refNum}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded bg-brand-green/20 text-[9px] font-bold text-brand-green hover:bg-brand-green/30 transition-colors no-underline align-text-top"
          title={citation?.source || `Source ${refNum}`}
        >
          {refNum}
        </a>
      );
    } else {
      // No URL — render as non-clickable badge
      parts.push(
        <span
          key={`${match.index}-${refNum}`}
          className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded bg-brand-gray/10 text-[9px] font-bold text-brand-gray/60 align-text-top"
        >
          {refNum}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

// ── Content Renderers ───────────────────────────────────────────────

function TableContent({ content, citations }: { content: Extract<DEStepContentBlock, { type: "table" }>; citations?: Citation[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            {content.headers.map((h) => (
              <th
                key={h}
                className="border border-brand-black/10 bg-brand-black px-3 py-2 text-left font-semibold text-white"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-brand-cream/30"}>
              {content.headers.map((h) => (
                <td
                  key={h}
                  className={`border border-brand-black/10 px-3 py-2 text-brand-black ${
                    h === content.headers[0] ? "font-medium" : ""
                  }`}
                >
                  <CitedText text={row[h] ?? "—"} citations={citations} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileContent({ content, citations }: { content: Extract<DEStepContentBlock, { type: "profile" }>; citations?: Citation[] }) {
  return (
    <div className="space-y-3">
      {content.sections.map((section) => (
        <div key={section.label} className="rounded-lg border border-brand-black/5 p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-orange">
            {section.label}
          </span>
          <p className="mt-1 text-sm leading-relaxed text-brand-gray">
            <CitedText text={section.value} citations={citations} />
          </p>
        </div>
      ))}
    </div>
  );
}

function MetricsContent({ content, citations }: { content: Extract<DEStepContentBlock, { type: "metrics" }>; citations?: Citation[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {content.items.map((item) => (
        <div key={item.label} className="rounded-lg border border-brand-black/5 p-3">
          <p className="text-xs text-brand-gray">
            <CitedText text={item.label} citations={citations} />
          </p>
          <p className="mt-1 text-lg font-bold text-brand-black">
            <CitedText text={item.value} citations={citations} />
          </p>
          {item.explanation && (
            <p className="mt-0.5 text-[11px] text-brand-gray/60">
              <CitedText text={item.explanation} citations={citations} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function TextContent({ content, citations }: { content: Extract<DEStepContentBlock, { type: "text" }>; citations?: Citation[] }) {
  return (
    <p className="text-sm leading-relaxed text-brand-gray">
      <CitedText text={content.body} citations={citations} />
    </p>
  );
}

// ── Block Content — renders any single content block ────────────────

function BlockContent({ content, citations }: { content: DEStepContentBlock; citations?: Citation[] }) {
  return (
    <>
      {content.label && (
        <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-orange mb-2">
          {content.label}
        </h4>
      )}
      {content.type === "table" && <TableContent content={content} citations={citations} />}
      {content.type === "profile" && <ProfileContent content={content} citations={citations} />}
      {content.type === "metrics" && <MetricsContent content={content} citations={citations} />}
      {content.type === "text" && <TextContent content={content} citations={citations} />}
    </>
  );
}

// ── Multi Content — renders an array of blocks ─────────────────────

function MultiContent({ content, citations }: { content: Extract<DEStepContent, { type: "multi" }>; citations?: Citation[] }) {
  return (
    <div className="space-y-6">
      {content.blocks.map((block, i) => (
        <div key={i}>
          <BlockContent content={block} citations={citations} />
        </div>
      ))}
    </div>
  );
}

// ── Numbered Citation ───────────────────────────────────────────────

function NumberedCitation({ citation, index }: { citation: Citation; index: number }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-brand-green/5 border border-brand-green/15 px-3 py-2">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-[9px] font-bold text-brand-green">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-brand-black">
          {citation.text}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-brand-gray/60">
          <span className="font-medium">{citation.source}</span>
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange hover:underline"
            >
              view source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Card ───────────────────────────────────────────────────────

export default function DEStepCard({ step, citations }: DEStepCardProps) {
  const [isExpanded, setIsExpanded] = useState(step.status !== "not_started");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const config = statusConfig[step.status];

  // Track previous content to detect AI-driven changes
  const prevContentRef = useRef<string>(JSON.stringify(step.content));

  useEffect(() => {
    const currentContent = JSON.stringify(step.content);
    if (prevContentRef.current !== currentContent) {
      prevContentRef.current = currentContent;
      setIsHighlighted(true);
      // Auto-expand when content changes
      setIsExpanded(true);
      const timer = setTimeout(() => setIsHighlighted(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [step.content]);

  const hasCitations = citations && citations.length > 0;

  return (
    <div
      id={`de-step-${step.number}`}
      className={`rounded-2xl border border-brand-black/5 bg-white transition-all ${
        isHighlighted ? "animate-[highlightFlash_1.5s_ease-out]" : ""
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-4 p-4 text-left cursor-pointer"
      >
        {/* Step number circle */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            step.status === "complete"
              ? "bg-brand-orange text-white"
              : step.status === "in_progress"
                ? "bg-brand-teal/20 text-brand-teal"
                : "bg-brand-black/5 text-brand-gray/40"
          }`}
        >
          {step.number}
        </div>

        {/* Title + badge */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold ${
              step.status === "not_started" ? "text-brand-gray/40" : "text-brand-black"
            }`}
          >
            {step.title}
          </h3>
        </div>

        <Badge variant={config.badge}>{config.label}</Badge>

        {/* Citation count */}
        {hasCitations && (
          <Badge variant="green">{citations.length} cite{citations.length > 1 ? "s" : ""}</Badge>
        )}

        {/* Chevron */}
        <svg
          className={`h-5 w-5 shrink-0 text-brand-gray/40 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content — collapsible */}
      {isExpanded && (
        <div className="border-t border-brand-black/5 p-4">
          {step.content.type === "multi"
            ? <MultiContent content={step.content} citations={citations} />
            : <BlockContent content={step.content} citations={citations} />
          }

          {/* Numbered citations for this step */}
          {hasCitations && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-gray/50">
                Sources
              </p>
              {citations.map((c, i) => (
                <NumberedCitation key={c.id} citation={c} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
