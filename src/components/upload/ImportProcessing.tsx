"use client";

import { useEffect, useRef } from "react";

interface ImportProcessingProps {
  thoughts: string[];
  isComplete: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function ImportProcessing({
  thoughts,
  isComplete,
  error,
  onRetry,
}: ImportProcessingProps) {
  const thoughtsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    thoughtsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thoughts]);

  return (
    <div className="animate-[slideUp_300ms_ease-out]">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-brand-black">
          {error
            ? "Import Failed"
            : isComplete
              ? "Import Complete"
              : "Processing Import"}
        </h3>
        <p className="mt-2 text-brand-gray">
          {error
            ? "Something went wrong during import."
            : isComplete
              ? "Your data has been imported successfully."
              : "Our AI agent is analyzing your Orbit data..."}
        </p>
      </div>

      {/* Progress indicator */}
      {!isComplete && !error && (
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <span className="text-sm font-medium text-brand-orange">
            Agent working...
          </span>
        </div>
      )}

      {/* Complete indicator */}
      {isComplete && (
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green/20">
            <svg
              className="h-4 w-4 text-brand-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-brand-green">
            Import complete
          </span>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={onRetry}
            className="rounded-full bg-brand-orange px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange/90 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Thoughts stream */}
      {thoughts.length > 0 && (
        <div className="rounded-2xl border border-brand-black/10 bg-brand-cream/30 p-4 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {thoughts.map((thought, i) => (
              <div
                key={i}
                className="flex items-start gap-2 animate-[fadeIn_200ms_ease-out]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-orange/60" />
                <p className="text-sm text-brand-gray leading-relaxed">
                  {thought}
                </p>
              </div>
            ))}
          </div>
          <div ref={thoughtsEndRef} />
        </div>
      )}

      {/* Opening message */}
      {isComplete && (
        <p className="mt-4 text-center text-sm text-brand-gray">
          Opening your report editor...
        </p>
      )}
    </div>
  );
}
