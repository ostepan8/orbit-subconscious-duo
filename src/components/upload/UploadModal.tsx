"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DE_STEP_TITLES } from "@/types/de-framework";
import { parseOrbitPaste } from "@/lib/parseOrbitPaste";
import PasteInput from "./PasteInput";
import ImportProcessing from "./ImportProcessing";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string; // When set, import into existing report (no new report creation)
}

type ImportState =
  | { stage: "idle" }
  | { stage: "creating" }
  | { stage: "processing"; thoughts: string[] }
  | { stage: "complete"; thoughts: string[]; externalId: string }
  | { stage: "error"; error: string; pasteText: string };

export default function UploadModal({ isOpen, onClose, reportId: existingReportId }: UploadModalProps) {
  const router = useRouter();
  const seedFromPaste = useMutation(api.seed.seedFromPaste);
  const [importState, setImportState] = useState<ImportState>({ stage: "idle" });
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const abortRef = useRef<AbortController | null>(null);

  const handleClose = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setImportState({ stage: "idle" });
    onClose();
  };

  const streamImport = async (reportId: string, pasteText: string, externalId: string, stepNumber: number) => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/import/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, pasteText, stepNumber }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Import stream failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);

          if (payload === "[DONE]") continue;

          try {
            const data = JSON.parse(payload) as {
              type: string;
              thought?: string;
              message?: string;
            };

            if (data.type === "thought" && data.thought) {
              setImportState((prev) => {
                if (prev.stage === "processing") {
                  return { ...prev, thoughts: [...prev.thoughts, data.thought!] };
                }
                return prev;
              });
            } else if (data.type === "complete") {
              setImportState((prev) => {
                const thoughts = prev.stage === "processing" ? prev.thoughts : [];
                return { stage: "complete", thoughts, externalId };
              });
            } else if (data.type === "error") {
              setImportState({
                stage: "error",
                error: data.message || "Unknown error",
                pasteText,
              });
            }
          } catch {
            // Ignore unparseable lines
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return; // Cancelled, ignore
      }
      setImportState({
        stage: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        pasteText,
      });
    } finally {
      abortRef.current = null;
    }
  };

  const handlePasteSubmit = async (text: string) => {
    try {
      setImportState({ stage: "creating" });

      const parsed = parseOrbitPaste(text);

      if (existingReportId) {
        setImportState({ stage: "processing", thoughts: [] });
        await streamImport(existingReportId, text, existingReportId, selectedStep);
      } else {
        const result = await seedFromPaste({
          title: parsed.title,
          contextSteps: parsed.contextSteps,
        });

        setImportState({ stage: "processing", thoughts: [] });
        await streamImport(result.reportId, text, result.externalId, selectedStep);
      }
    } catch (err) {
      setImportState({
        stage: "error",
        error: err instanceof Error ? err.message : "Failed to create report",
        pasteText: text,
      });
    }
  };

  const handleImportRetry = () => {
    if (importState.stage === "error") {
      handlePasteSubmit(importState.pasteText);
    } else {
      setImportState({ stage: "idle" });
    }
  };

  // Navigate to report page on import completion (or just close if importing into existing)
  useEffect(() => {
    if (importState.stage === "complete") {
      const timer = setTimeout(() => {
        onClose();
        setImportState({ stage: "idle" });
        if (!existingReportId) {
          router.push(`/report/${importState.externalId}`);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [importState, router, onClose, existingReportId]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isImporting =
    importState.stage === "creating" ||
    importState.stage === "processing" ||
    importState.stage === "complete" ||
    importState.stage === "error";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_200ms_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm pointer-events-none" />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl animate-[slideUp_300ms_ease-out]">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-brand-gray transition-colors hover:bg-brand-cream hover:text-brand-black cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isImporting ? (
          <ImportProcessing
            thoughts={
              importState.stage === "processing" || importState.stage === "complete"
                ? importState.thoughts
                : []
            }
            isComplete={importState.stage === "complete"}
            error={importState.stage === "error" ? importState.error : null}
            onRetry={handleImportRetry}
          />
        ) : (
          <div className="animate-[slideUp_300ms_ease-out]">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-brand-black">
                {existingReportId ? "Import Orbit Data" : "Import from Orbit"}
              </h3>
              <p className="mt-2 text-brand-gray">
                {existingReportId
                  ? "Paste data from Orbit to fill out another step."
                  : "Paste your Orbit data and our AI agent will analyze and enrich it."}
              </p>
            </div>

            {/* Step selector */}
            <div className="mb-4">
              <label htmlFor="step-select" className="block text-xs font-semibold uppercase tracking-wider text-brand-gray/60 mb-2">
                Target step
              </label>
              <select
                id="step-select"
                value={selectedStep}
                onChange={(e) => setSelectedStep(Number(e.target.value))}
                className="w-full rounded-xl border border-brand-black/10 bg-white px-4 py-2.5 text-sm text-brand-black transition-colors hover:border-brand-orange/40 focus:border-brand-orange focus:outline-none cursor-pointer"
              >
                {DE_STEP_TITLES.map((title, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} — {title}
                  </option>
                ))}
              </select>
            </div>

            <PasteInput
              onSubmit={handlePasteSubmit}
              isLoading={false}
              hideHeader
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
