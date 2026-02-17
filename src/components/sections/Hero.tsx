"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useUploadContext } from "@/components/UploadFlowProvider";

export default function Hero() {
  const { openUpload } = useUploadContext();

  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-orange/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-teal/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Orbit Badge */}
          <Badge variant="teal" className="mb-6">
            Built for MIT Orbit
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-brand-black sm:text-6xl lg:text-7xl">
            Deep Research,{" "}
            <span className="text-brand-orange">Powered by AI</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-brand-gray">
            Upload your Orbit Jetpack documentation and let our AI agents
            perform deep research, generate verified citations, and deliver
            actionable recommendations — in minutes, not weeks.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => openUpload()}>
              Import from Orbit
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-brand-gray">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-green" />
              AI Agents Online
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/Subconscious_Logo_Graphic.png"
                alt=""
                width={18}
                height={18}
              />
              Powered by Subconscious
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
