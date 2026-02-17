"use client";

import Button from "@/components/ui/Button";
import { useUploadContext } from "@/components/UploadFlowProvider";

export default function UploadCTA() {
  const { openUpload } = useUploadContext();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-black p-12 text-center md:p-20">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-orange/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-teal/10 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold text-brand-cream sm:text-4xl">
              Ready to Supercharge Your Research?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-brand-cream/60">
              Paste your Orbit data below and let our AI agents analyze, enrich, and cite it.
            </p>

            <div className="mt-8">
              <Button variant="primary" size="lg" onClick={() => openUpload()}>
                Import from Orbit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
