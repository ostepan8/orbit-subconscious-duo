import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";

// TODO: Add feature detail modals/expandable sections
// TODO: Add icons/illustrations for each feature
// TODO: Add feature comparison table

const features = [
  {
    title: "Multi-Agent Deep Research",
    description:
      "Multiple AI agents work in parallel to analyze your documents from different angles — technical, strategic, and operational.",
    tag: "Core",
    // TODO: Add link to detailed feature page
  },
  {
    title: "Verified Citation Generation",
    description:
      "Every insight is backed by traceable citations. Our agents cross-reference sources and validate claims before presenting them.",
    tag: "Trust",
    // TODO: Add citation format options
  },
  {
    title: "Priority-Ranked Recommendations",
    description:
      "Get clear, actionable advice ranked by impact and urgency. Each recommendation links back to supporting evidence.",
    tag: "Action",
    // TODO: Add recommendation filtering
  },
  {
    title: "Large PDF Processing",
    description:
      "Handle massive documents with hundreds of pages. Our system extracts structure, tables, and figures intelligently.",
    tag: "Scale",
    // TODO: Add supported file format list
  },
  {
    title: "Real-Time Agent Tracking",
    description:
      "Watch your research unfold in real-time. See which agents are active, what they're analyzing, and how far along they are.",
    tag: "Visibility",
    // TODO: Add live agent status dashboard
  },
  {
    title: "Export & Share Reports",
    description:
      "Download structured research reports as PDF, share them with your team, or push findings directly into your workflow.",
    tag: "Output",
    // TODO: Add export format options, sharing UI
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-brand-black/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Features"
          title="Everything You Need for Research at Scale"
          subtitle="Purpose-built for Orbit's complex documentation and research requirements."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <span className="mb-4 inline-block rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                {feature.tag}
              </span>
              <h3 className="mb-2 text-lg font-bold text-brand-black">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-brand-gray">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
