"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { ResearchResult, DEStep, Citation, Recommendation } from "@/types";
import Badge from "@/components/ui/Badge";
import DEFramework from "./DEFramework";

interface ReportDocumentProps {
  report: ResearchResult;
  deSteps: DEStep[];
  reportId: Id<"reports">;
  onSendMessage: (message: string) => void;
}

// ── Step Overview Item (flat row, no expand/collapse) ──

function StepOverviewItem({
  step,
  reportId,
}: {
  step: DEStep;
  reportId: Id<"reports">;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(step.headline ?? "");
  const [customValue, setCustomValue] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const selectHeadline = useMutation(api.deSteps.selectHeadline);

  // Sync editValue when headline changes externally (e.g. from AI)
  useEffect(() => {
    if (!isEditing) setEditValue(step.headline ?? "");
  }, [step.headline, isEditing]);

  const hasOptions = step.headlineOptions && step.headlineOptions.length > 0;
  const hasHeadline = !!step.headline;
  const isStarted = step.status !== "not_started";

  const handleSelect = async (headline: string) => {
    setSelectedOption(headline);
    await selectHeadline({
      reportId,
      stepId: step.id,
      headline,
    });
  };

  const handleCustomSubmit = async () => {
    const trimmed = customValue.trim();
    if (trimmed) {
      setSelectedOption(trimmed);
      setCustomValue("");
      await selectHeadline({
        reportId,
        stepId: step.id,
        headline: trimmed,
      });
    }
  };

  const handleEditSubmit = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== step.headline) {
      await selectHeadline({
        reportId,
        stepId: step.id,
        headline: trimmed,
      });
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setEditValue(step.headline ?? "");
      setIsEditing(false);
    }
  };

  const handleCopyHeadline = () => {
    if (!step.headline) return;
    navigator.clipboard.writeText(step.headline).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const startEditing = () => {
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="border-b border-brand-black/5 last:border-b-0">
      <div className="flex w-full items-center gap-3 py-2.5 px-1">
        {/* Status dot */}
        <div
          className={`h-2 w-2 shrink-0 rounded-full ${step.status === "complete"
            ? "bg-brand-green"
            : step.status === "in_progress"
              ? "bg-brand-teal"
              : "bg-brand-gray/20"
            }`}
        />

        {/* Step number + title + headline */}
        <span className="text-sm leading-relaxed flex-1 min-w-0">
          <strong className="text-brand-black">
            {step.number} - {step.title}
          </strong>
          {hasHeadline && !isEditing && (
            <span
              className="text-brand-gray hover:text-brand-black hover:underline decoration-brand-black/20 cursor-text transition-colors"
              onClick={startEditing}
            >
              : {step.headline}
            </span>
          )}
          {isEditing && (
            <span>
              :{" "}
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={handleEditKeyDown}
                className="inline-block w-[60%] border-b border-brand-orange bg-transparent text-sm text-brand-black outline-none"
              />
            </span>
          )}
          {!hasHeadline && hasOptions && (
            <span className="ml-2 text-xs text-brand-orange font-medium">
              Select headline
            </span>
          )}
          {!hasHeadline && !hasOptions && !isStarted && (
            <span className="text-brand-gray/40 italic">: Not started</span>
          )}
          {!hasHeadline && !hasOptions && isStarted && (
            <span className="text-brand-gray/40 italic">: Awaiting headline</span>
          )}
        </span>

        {/* Per-step copy button */}
        {hasHeadline && !isEditing && (
          <button
            onClick={handleCopyHeadline}
            className="shrink-0 rounded-md p-1 text-brand-gray/40 hover:text-brand-black hover:bg-brand-black/5 transition-all cursor-pointer"
            title="Copy headline"
          >
            {copied ? (
              <svg className="h-3.5 w-3.5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Headline options (shown inline when available) */}
      {hasOptions && (
        <div className="pl-6 pb-3 animate-[fadeIn_200ms_ease-out]">
          <div className="flex flex-wrap gap-2 mt-1">
            {step.headlineOptions!.map((option, i) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(option)}
                  disabled={!!selectedOption}
                  className={`rounded-xl border px-4 py-2.5 text-sm transition-all cursor-pointer active:scale-[0.98] ${isSelected
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange font-medium"
                    : selectedOption
                      ? "border-brand-black/5 bg-brand-cream/30 text-brand-gray/40"
                      : "border-brand-black/10 bg-white text-brand-black hover:border-brand-orange/50 hover:shadow-sm"
                    }`}
                >
                  {isSelected && (
                    <svg className="inline-block h-4 w-4 mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  {option}
                </button>
              );
            })}

            {/* Write-in option */}
            {!selectedOption && (
              <div
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-brand-black/10 bg-white px-3 py-1.5"
                onClick={() => customInputRef.current?.focus()}
              >
                <input
                  ref={customInputRef}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomSubmit();
                    }
                  }}
                  placeholder="Write your own..."
                  className="w-36 bg-transparent text-sm text-brand-black placeholder:text-brand-gray/40 outline-none"
                />
                {customValue.trim() && (
                  <button
                    onClick={() => handleCustomSubmit()}
                    className="shrink-0 rounded-full bg-brand-orange p-1 text-white transition-colors hover:bg-brand-orange/80 cursor-pointer"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recommendation Item (accept / reject) ──

function RecommendationItem({
  rec,
  reportId,
  onSendMessage,
}: {
  rec: Recommendation;
  reportId: Id<"reports">;
  onSendMessage: (message: string) => void;
}) {
  const updateStatus = useMutation(api.reports.updateRecommendationStatus);
  const isAccepted = rec.status === "accepted";

  const handleAccept = async () => {
    await updateStatus({ reportId, externalId: rec.id, status: "accepted" });
    onSendMessage(
      `I accepted the recommendation: "${rec.title}". Please help me implement this — ${rec.description}`
    );
  };

  const handleReject = async () => {
    await updateStatus({ reportId, externalId: rec.id, status: "rejected" });
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${isAccepted
        ? "border-brand-orange/20 bg-brand-orange/5"
        : "border-brand-black/5 bg-white"
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isAccepted && (
              <svg className="h-4 w-4 shrink-0 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            <h4 className="font-semibold text-brand-black">{rec.title}</h4>
            <Badge
              variant={
                rec.priority === "high"
                  ? "orange"
                  : rec.priority === "medium"
                    ? "teal"
                    : "gray"
              }
            >
              {rec.priority}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-brand-gray">
            {rec.description}
          </p>
        </div>

        {/* Accept / Reject buttons — only show for pending */}
        {!isAccepted && (
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <button
              onClick={handleAccept}
              className="flex items-center gap-1 rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-3 py-1.5 text-xs font-medium text-brand-orange transition-all hover:bg-brand-orange hover:text-white cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Accept
            </button>
            <button
              onClick={handleReject}
              className="flex items-center gap-1 rounded-lg border border-brand-black/10 px-3 py-1.5 text-xs font-medium text-brand-gray transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Key Decisions Section (with copy button) ──

function KeyDecisionsSection({
  deSteps,
  reportId,
}: {
  deSteps: DEStep[];
  reportId: Id<"reports">;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const lines = deSteps
      .filter((s) => s.headline)
      .map((s) => s.headline!);

    if (lines.length === 0) return;

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [deSteps]);

  const selectedCount = deSteps.filter((s) => s.headline).length;

  return (
    <div className="mt-8 rounded-2xl border border-brand-black/5 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-brand-black uppercase tracking-wider">
          Key Decisions
        </h2>
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-brand-black/10 px-2.5 py-1 text-xs text-brand-gray hover:text-brand-black hover:border-brand-black/20 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
          <span className="text-xs text-brand-gray">
            {selectedCount} of {deSteps.length} selected
          </span>
        </div>
      </div>
      <div>
        {deSteps.map((step) => (
          <StepOverviewItem key={step.id} step={step} reportId={reportId} />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──

export default function ReportDocument({
  report,
  deSteps,
  reportId,
  onSendMessage,
}: ReportDocumentProps) {
  // Build a map of citations per step
  const citationsByStep: Record<string, Citation[]> = {};
  const generalCitations: Citation[] = [];

  for (const c of report.citations) {
    if (c.stepId) {
      if (!citationsByStep[c.stepId]) citationsByStep[c.stepId] = [];
      citationsByStep[c.stepId].push(c);
    } else {
      generalCitations.push(c);
    }
  }

  return (
    <div className="mx-auto max-w-6xl py-10 px-8">
      {/* Report Title */}
      <h1 className="text-3xl font-bold tracking-tight text-brand-black">
        {report.title}
      </h1>

      {/* Metadata */}
      <div className="mt-3 flex items-center gap-3 text-sm text-brand-gray">
        <span>Generated {report.createdAt.toLocaleDateString()}</span>
        <span>&bull;</span>
        <Badge variant="green">{report.citations.length} citations</Badge>
        <Badge variant="teal">{report.recommendations.length} recommendations</Badge>
      </div>

      {/* Step Overview — interactive headline selection */}
      <KeyDecisionsSection deSteps={deSteps} reportId={reportId} />

      {/* 24 Steps of Disciplined Entrepreneurship */}
      <div className="mt-10">
        <DEFramework steps={deSteps} citationsByStep={citationsByStep} />
      </div>

      {/* General Citations (not linked to any step) */}
      {generalCitations.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-brand-black">General Citations</h3>
            <Badge variant="green">{generalCitations.length} found</Badge>
          </div>
          <div className="space-y-3">
            {generalCitations.map((citation) => (
              <div
                key={citation.id}
                className="rounded-2xl border border-brand-black/5 bg-white p-4"
              >
                <p className="text-sm leading-relaxed text-brand-gray">
                  &ldquo;{citation.text}&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-brand-gray/60">
                  <span>{citation.source}</span>
                  {citation.pageNumber && <span>· p. {citation.pageNumber}</span>}
                  {citation.url && (
                    <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">
                      source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="mt-10 pb-10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-brand-black">Recommendations</h3>
            <Badge variant="teal">
              {report.recommendations.filter((r) => r.status !== "rejected").length} actions
            </Badge>
          </div>
          <div className="space-y-3">
            {report.recommendations
              .filter((r) => r.status !== "rejected")
              .map((rec) => (
                <RecommendationItem
                  key={rec.id}
                  rec={rec}
                  reportId={reportId}
                  onSendMessage={onSendMessage}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
