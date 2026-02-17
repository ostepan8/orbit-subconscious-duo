"use client";

import ReportHeader from "@/components/report/ReportHeader";
import AuthGuard from "@/components/auth/AuthGuard";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col">
        <ReportHeader />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </AuthGuard>
  );
}
