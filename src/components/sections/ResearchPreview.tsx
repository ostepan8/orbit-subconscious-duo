import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";

// TODO: Replace mock data with real research results
// TODO: Add expandable sections for full citation text
// TODO: Add "Copy Citation" button
// TODO: Add interactive recommendation cards
// TODO: Wire up to research API

const mockCitations = [
  {
    id: "1",
    text: "The Jetpack propulsion system achieves 98.7% efficiency under nominal operating conditions (Section 4.2)",
    source: "Orbit Technical Specification v3.1",
    relevance: "High",
  },
  {
    id: "2",
    text: "Thermal management subsystem requires recalibration every 500 flight hours per maintenance protocol",
    source: "Orbit Maintenance Manual",
    relevance: "High",
  },
  {
    id: "3",
    text: "Power distribution architecture supports redundant pathways for critical flight systems",
    source: "System Architecture Document",
    relevance: "Medium",
  },
];

const mockRecommendations = [
  {
    id: "1",
    title: "Update thermal calibration schedule",
    priority: "high" as const,
    description: "Based on recent flight data, consider reducing calibration intervals from 500 to 400 hours.",
  },
  {
    id: "2",
    title: "Review redundancy protocols",
    priority: "medium" as const,
    description: "Cross-reference power distribution docs with latest safety standards for enhanced coverage.",
  },
];

const priorityColors = {
  high: "orange",
  medium: "teal",
  low: "gray",
} as const;

export default function ResearchPreview() {
  return (
    <section id="research-preview" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Preview"
          title="See What Our Agents Discover"
          subtitle="Here's a glimpse of the structured research output you'll receive."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Citations Panel */}
          <div className="rounded-2xl border border-brand-black/5 bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-black">
                Generated Citations
              </h3>
              <Badge variant="green">{mockCitations.length} found</Badge>
            </div>

            <div className="space-y-4">
              {mockCitations.map((citation) => (
                <div
                  key={citation.id}
                  className="rounded-xl border border-brand-black/5 p-4 transition-colors hover:bg-brand-cream/50"
                >
                  <p className="text-sm leading-relaxed text-brand-black">
                    &ldquo;{citation.text}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-brand-gray">
                      {citation.source}
                    </span>
                    <Badge
                      variant={citation.relevance === "High" ? "orange" : "gray"}
                    >
                      {citation.relevance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* TODO: Add "View All Citations" button */}
            {/* TODO: Add citation export (BibTeX, APA, etc.) */}
          </div>

          {/* Recommendations Panel */}
          <div className="rounded-2xl border border-brand-black/5 bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-black">
                Recommendations
              </h3>
              <Badge variant="teal">{mockRecommendations.length} actions</Badge>
            </div>

            <div className="space-y-4">
              {mockRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-brand-black/5 p-4 transition-colors hover:bg-brand-cream/50"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant={priorityColors[rec.priority]}>
                      {rec.priority}
                    </Badge>
                    <div>
                      <h4 className="font-semibold text-brand-black">
                        {rec.title}
                      </h4>
                      <p className="mt-1 text-sm text-brand-gray">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TODO: Add "Implement Recommendation" action buttons */}
            {/* TODO: Add recommendation detail modals */}
          </div>
        </div>

        {/* Agent Status Mock */}
        {/* TODO: Replace with real agent status tracking */}
        <div className="mt-8 rounded-2xl border border-brand-black/5 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-gray">
            Agent Activity
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "Research Agent", status: "Complete", progress: 100 },
              { name: "Citation Agent", status: "Complete", progress: 100 },
              { name: "Recommendation Agent", status: "Complete", progress: 100 },
            ].map((agent) => (
              <div key={agent.name} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-green" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-black">{agent.name}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-black/5">
                    <div
                      className="h-full rounded-full bg-brand-green transition-all"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-brand-gray">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
