"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ReportEditor from "@/components/report/ReportEditor";
import Link from "next/link";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const { id } = use(params);

  const report = useQuery(api.reports.getReport, { externalId: id });

  // Loading state
  if (report === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <p className="mt-3 text-sm text-brand-gray">Loading report...</p>
        </div>
      </div>
    );
  }

  // Report not found or not owned by user
  if (report === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-brand-black">
            Report not found
          </p>
          <p className="mt-2 text-sm text-brand-gray">
            This report doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 transition-all hover:bg-brand-orange/90"
          >
            Back to My Ventures
          </Link>
        </div>
      </div>
    );
  }

  return <ReportEditor reportId={report._id} />;
}
