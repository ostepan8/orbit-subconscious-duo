"use client";

import type { Recommendation, EditTarget } from "@/types";
import Badge from "@/components/ui/Badge";
import EditableField from "./EditableField";
import { editTargetToKey } from "@/hooks/useReportEditor";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onUpdateField: (field: "title" | "description", value: string) => void;
  isHighlighted: (target: EditTarget) => boolean;
  clearHighlight: (key: string) => void;
  version: number;
}

const priorityVariant = {
  high: "orange",
  medium: "teal",
  low: "gray",
} as const;

export default function RecommendationCard({
  recommendation,
  onUpdateField,
  isHighlighted,
  clearHighlight,
  version,
}: RecommendationCardProps) {
  const titleTarget: EditTarget = {
    type: "recommendation",
    recommendationId: recommendation.id,
    field: "title",
  };
  const descTarget: EditTarget = {
    type: "recommendation",
    recommendationId: recommendation.id,
    field: "description",
  };

  return (
    <div className="rounded-xl border border-brand-black/5 p-4 transition-colors hover:bg-brand-cream/30">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Badge variant={priorityVariant[recommendation.priority]}>
          {recommendation.priority}
        </Badge>
        <Badge variant="gray">{recommendation.category}</Badge>
      </div>

      {/* Title */}
      <EditableField
        value={recommendation.title}
        onChange={(v) => onUpdateField("title", v)}
        isHighlighted={isHighlighted(titleTarget)}
        onHighlightEnd={() => clearHighlight(editTargetToKey(titleTarget))}
        className="font-semibold text-brand-black"
        tag="h4"
        version={version}
      />

      {/* Description */}
      <EditableField
        value={recommendation.description}
        onChange={(v) => onUpdateField("description", v)}
        isHighlighted={isHighlighted(descTarget)}
        onHighlightEnd={() => clearHighlight(editTargetToKey(descTarget))}
        className="mt-1 text-sm leading-relaxed text-brand-gray"
        tag="p"
        version={version}
      />
    </div>
  );
}
