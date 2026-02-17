"use client";

import { useCallback } from "react";
import type { DEStep } from "@/types/de-framework";
import type { Citation } from "@/types";
import DEStepCard from "./DEStepCard";

interface DEFrameworkProps {
  steps: DEStep[];
  citationsByStep?: Record<string, Citation[]>;
}

export default function DEFramework({ steps, citationsByStep }: DEFrameworkProps) {
  const completed = steps.filter((s) => s.status === "complete").length;
  const inProgress = steps.filter((s) => s.status === "in_progress").length;
  const pct = Math.round((completed / steps.length) * 100);

  const handleJumpTo = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const stepNum = Number(e.target.value);
    if (!stepNum) return;

    const el = document.getElementById(`de-step-${stepNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Brief highlight flash
      el.classList.add("ring-2", "ring-brand-orange/50");
      setTimeout(() => el.classList.remove("ring-2", "ring-brand-orange/50"), 1500);
    }

    // Reset select back to placeholder
    e.target.value = "0";
  }, []);

  return (
    <div className="mb-10">
      {/* Header + Progress + Jump-to */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-brand-black">
            24 Steps of Disciplined Entrepreneurship
          </h2>
          <span className="text-sm font-medium text-brand-gray shrink-0">
            {completed} of {steps.length} complete
            {inProgress > 0 && ` · ${inProgress} in progress`}
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-black/5">
          <div
            className="h-full rounded-full bg-brand-orange transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Jump-to step selector */}
        <div className="mt-4">
          <select
            defaultValue={0}
            onChange={handleJumpTo}
            className="w-full rounded-xl border border-brand-black/10 bg-white px-4 py-2.5 text-sm text-brand-black transition-colors hover:border-brand-orange/40 focus:border-brand-orange focus:outline-none cursor-pointer"
          >
            <option value={0}>Jump to step...</option>
            {steps.map((step) => {
              const citCount = citationsByStep?.[step.id]?.length ?? 0;
              const statusLabel =
                step.status === "complete" ? "✓" :
                step.status === "in_progress" ? "…" : "○";
              return (
                <option key={step.id} value={step.number}>
                  {statusLabel} {step.number} — {step.title}
                  {step.headline ? `: ${step.headline}` : ""}
                  {citCount > 0 ? ` (${citCount} cites)` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {steps.map((step) => (
          <DEStepCard
            key={step.id}
            step={step}
            citations={citationsByStep?.[step.id]}
          />
        ))}
      </div>
    </div>
  );
}
