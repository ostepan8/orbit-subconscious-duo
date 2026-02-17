"use client";

import { useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { ChatMessage } from "@/types";
import ReportDocument from "./ReportDocument";
import ChatSidebar from "./ChatSidebar";
import { useConvexChat } from "@/hooks/useChat";
import { useUploadContext } from "@/components/UploadFlowProvider";

interface ReportEditorProps {
  reportId: Id<"reports">;
}

export default function ReportEditor({ reportId }: ReportEditorProps) {
  // ── Convex queries (real-time subscriptions) ──
  const report = useQuery(api.reports.getReportById, { reportId });
  const citations = useQuery(api.reports.getCitations, { reportId });
  const recommendations = useQuery(api.reports.getRecommendations, { reportId });
  const deSteps = useQuery(api.deSteps.getSteps, { reportId });
  const dbMessages = useQuery(api.chat.getMessages, { reportId });

  // ── Chat ──
  const { isThinking, thoughts, sendMessage, editMessage, messagesEndRef } = useConvexChat({ reportId });
  const { openUpload } = useUploadContext();
  const handleImportClick = useCallback(() => openUpload(reportId), [openUpload, reportId]);

  // Transform DB messages to ChatMessage format
  const messages: ChatMessage[] = (dbMessages ?? []).map((m) => ({
    id: m._id,
    role: m.role as "user" | "assistant",
    content: m.content,
    timestamp: new Date(m.timestamp),
  }));

  // Loading state
  if (!report || !citations || !recommendations || !deSteps || !dbMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <p className="mt-3 text-sm text-brand-gray">Loading report data...</p>
        </div>
      </div>
    );
  }

  // Build ResearchResult-like shape for ReportDocument
  const reportData = {
    id: reportId,
    documentId: "convex",
    title: report.title,
    summary: report.summary,
    citations: citations.map((c) => ({
      id: c.externalId,
      text: c.text,
      source: c.source,
      pageNumber: c.pageNumber,
      url: c.url,
      relevanceScore: c.relevanceScore,
      stepId: c.stepId,
    })),
    recommendations: recommendations.map((r) => ({
      id: r.externalId,
      title: r.title,
      description: r.description,
      priority: r.priority as "high" | "medium" | "low",
      category: r.category,
      status: (r.status as "pending" | "accepted" | "rejected" | undefined) ?? "pending",
    })),
    createdAt: new Date(report.createdAt),
  };

  // Build DEStep[] from Convex data
  const deStepData = deSteps.map((s) => ({
    id: s.stepId,
    number: s.number,
    title: s.title,
    status: s.status as "not_started" | "in_progress" | "complete",
    content: s.content,
    headline: s.headline,
    headlineOptions: s.headlineOptions,
  }));

  return (
    <div className="flex h-full">
      {/* Left: Document */}
      <div className="flex-[3] overflow-y-auto border-r border-brand-black/5 bg-brand-cream/20">
        <ReportDocument
          report={reportData}
          deSteps={deStepData}
          reportId={reportId}
          onSendMessage={sendMessage}
        />
      </div>

      {/* Right: Chat */}
      <div className="flex-[2] border-l border-brand-black/5">
        <ChatSidebar
          messages={messages}
          isThinking={isThinking}
          thoughts={thoughts}
          onSendMessage={sendMessage}
          onEditMessage={editMessage}
          messagesEndRef={messagesEndRef}
          onImportClick={handleImportClick}
        />
      </div>
    </div>
  );
}
