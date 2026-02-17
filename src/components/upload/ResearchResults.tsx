import type { ResearchResult } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface ResearchResultsProps {
  result: ResearchResult;
  onClose: () => void;
}

const priorityVariant = {
  high: "orange",
  medium: "teal",
  low: "gray",
} as const;

export default function ResearchResults({ result, onClose }: ResearchResultsProps) {
  return (
    <div className="animate-[slideUp_300ms_ease-out]">
      {/* Success header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/20">
          <svg className="h-6 w-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-brand-black">Research Complete</h3>
        <p className="mt-2 text-brand-gray">{result.title}</p>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-xl border border-brand-black/5 bg-brand-cream/30 p-4">
        <p className="text-sm leading-relaxed text-brand-gray">{result.summary}</p>
      </div>

      {/* Two-column results */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Citations */}
        <div className="rounded-xl border border-brand-black/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-brand-black">Citations</h4>
            <Badge variant="green">{result.citations.length} found</Badge>
          </div>
          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {result.citations.map((cit) => (
              <div key={cit.id} className="rounded-lg border border-brand-black/5 p-3">
                <p className="text-xs leading-relaxed text-brand-black">
                  &ldquo;{cit.text}&rdquo;
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-brand-gray">{cit.source}</span>
                  {cit.pageNumber && (
                    <span className="text-[10px] text-brand-gray">p.{cit.pageNumber}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-brand-black/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-brand-black">Recommendations</h4>
            <Badge variant="teal">{result.recommendations.length} actions</Badge>
          </div>
          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {result.recommendations.map((rec) => (
              <div key={rec.id} className="rounded-lg border border-brand-black/5 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={priorityVariant[rec.priority]}>{rec.priority}</Badge>
                  <span className="text-xs font-semibold text-brand-black">{rec.title}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-brand-gray">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button
          size="sm"
          onClick={() => {
            // TODO: Implement real report download
            onClose();
          }}
        >
          Download Report
        </Button>
      </div>
    </div>
  );
}
