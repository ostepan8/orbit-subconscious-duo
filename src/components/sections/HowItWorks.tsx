import SectionHeading from "@/components/ui/SectionHeading";

// TODO: Add step animations on scroll
// TODO: Add connecting line between steps
// TODO: Add interactive demo for each step

const steps = [
  {
    number: "01",
    title: "Upload Your Document",
    description:
      "Drop in any PDF from Orbit's Jetpack system — technical specs, research papers, mission briefs. Our system handles documents of any size.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    color: "bg-brand-orange/10 text-brand-orange",
  },
  {
    number: "02",
    title: "AI Deep Research",
    description:
      "Subconscious agents analyze your document, cross-reference external sources, and perform multi-layered research to surface key insights.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    color: "bg-brand-teal/10 text-brand-teal",
  },
  {
    number: "03",
    title: "Get Citations & Advice",
    description:
      "Receive a structured report with verified citations, priority-ranked recommendations, and clear next steps for your Orbit project.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    color: "bg-brand-green/10 text-brand-black",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="How It Works"
          title="From Document to Insight in 3 Steps"
          subtitle="Our AI agents handle the heavy lifting so your team can focus on what matters."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-brand-black/5 bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Step Number */}
              <span className="text-6xl font-bold text-brand-black/5 absolute top-4 right-6">
                {step.number}
              </span>

              {/* Icon */}
              <div className={`mb-6 inline-flex rounded-xl p-3 ${step.color}`}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-brand-black">
                {step.title}
              </h3>
              <p className="text-brand-gray leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
