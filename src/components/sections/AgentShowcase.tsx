import Image from "next/image";

// TODO: Add animated agent flow diagram
// TODO: Add live agent status indicators
// TODO: Add agent configuration options

export default function AgentShowcase() {
  return (
    <section className="bg-brand-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center rounded-full bg-brand-orange/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange">
            Under the Hood
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-brand-cream sm:text-4xl">
            Powered by Subconscious Agents
          </h2>
          <p className="mt-4 text-lg text-brand-cream/60 leading-relaxed">
            Our multi-agent architecture orchestrates specialized AI agents that
            work together to deliver comprehensive research results.
          </p>
        </div>

        {/* Agent Flow */}
        {/* TODO: Replace with interactive diagram */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Document Parser",
              desc: "Extracts text, tables, figures, and structure from your PDF with high fidelity.",
              status: "Ready",
            },
            {
              name: "Research Agent",
              desc: "Performs multi-hop reasoning across the document and external knowledge bases.",
              status: "Ready",
            },
            {
              name: "Citation & Report Agent",
              desc: "Validates findings, generates citations, and assembles the final structured report.",
              status: "Ready",
            },
          ].map((agent) => (
            <div
              key={agent.name}
              className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <Image
                  src="/Subconscious_Logo_Graphic.png"
                  alt=""
                  width={24}
                  height={24}
                  className="opacity-80"
                />
                <h3 className="text-lg font-bold text-brand-cream">
                  {agent.name}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-brand-cream/60">
                {agent.desc}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-brand-green" />
                <span className="text-xs text-brand-green">{agent.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TODO: Add "Learn more about our agents" link to docs */}
      </div>
    </section>
  );
}
