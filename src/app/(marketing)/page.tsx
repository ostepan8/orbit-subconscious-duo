import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import AgentShowcase from "@/components/sections/AgentShowcase";
import ResearchPreview from "@/components/sections/ResearchPreview";
import UploadCTA from "@/components/sections/UploadCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <AgentShowcase />
      <ResearchPreview />
      <UploadCTA />
    </>
  );
}
