"use client";

import type { Citation, EditTarget } from "@/types";
import Badge from "@/components/ui/Badge";
import EditableField from "./EditableField";
import { editTargetToKey } from "@/hooks/useReportEditor";

interface CitationCardProps {
  citation: Citation;
  onUpdateField: (field: "text" | "source", value: string) => void;
  isHighlighted: (target: EditTarget) => boolean;
  clearHighlight: (key: string) => void;
  version: number;
}

export default function CitationCard({
  citation,
  onUpdateField,
  isHighlighted,
  clearHighlight,
  version,
}: CitationCardProps) {
  const textTarget: EditTarget = { type: "citation", citationId: citation.id, field: "text" };
  const sourceTarget: EditTarget = { type: "citation", citationId: citation.id, field: "source" };

  return (
    <div className="rounded-xl border border-brand-black/5 p-4 transition-colors hover:bg-brand-cream/30">
      {/* Citation text */}
      <div className="text-sm leading-relaxed text-brand-black">
        <span className="text-brand-gray">&ldquo;</span>
        <EditableField
          value={citation.text}
          onChange={(v) => onUpdateField("text", v)}
          isHighlighted={isHighlighted(textTarget)}
          onHighlightEnd={() => clearHighlight(editTargetToKey(textTarget))}
          className="inline text-sm leading-relaxed text-brand-black"
          tag="span"
          version={version}
        />
        <span className="text-brand-gray">&rdquo;</span>
      </div>

      {/* Source + metadata */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <EditableField
          value={citation.source}
          onChange={(v) => onUpdateField("source", v)}
          isHighlighted={isHighlighted(sourceTarget)}
          onHighlightEnd={() => clearHighlight(editTargetToKey(sourceTarget))}
          className="text-xs text-brand-gray"
          tag="span"
          version={version}
        />
        <div className="flex items-center gap-2 shrink-0">
          {citation.pageNumber && (
            <span className="text-[10px] text-brand-gray">p.{citation.pageNumber}</span>
          )}
          <Badge variant={citation.relevanceScore >= 0.9 ? "orange" : "gray"}>
            {Math.round(citation.relevanceScore * 100)}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
