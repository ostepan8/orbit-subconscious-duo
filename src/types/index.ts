// TODO: Expand types as features are implemented

export interface PDFDocument {
  id: string;
  fileName: string;
  uploadedAt: Date;
  status: "uploading" | "processing" | "researching" | "complete" | "error";
  pageCount?: number;
  sizeBytes?: number;
}

export interface ResearchResult {
  id: string;
  documentId: string;
  title: string;
  summary: string;
  citations: Citation[];
  recommendations: Recommendation[];
  createdAt: Date;
  // TODO: Add confidence scores, source tracking, etc.
}

export interface Citation {
  id: string;
  text: string;
  source: string;
  pageNumber?: number;
  url?: string;
  relevanceScore: number;
  stepId?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  status?: "pending" | "accepted" | "rejected";
}

export interface AgentStatus {
  name: string;
  status: "idle" | "running" | "complete" | "error";
  progress: number; // 0-100
  currentTask?: string;
}

// ── Chat types ──────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Report editor types ─────────────────────────────────────────────

export type EditTarget =
  | { type: "title" }
  | { type: "summary" }
  | { type: "citation"; citationId: string; field: "text" | "source" }
  | { type: "recommendation"; recommendationId: string; field: "title" | "description" }
  | { type: "de_step"; stepId: string };

export type { DEStep, DEStepContent, StepStatus } from "./de-framework";

import type { DEStepContent, StepStatus } from "./de-framework";

export interface EditAction {
  target: EditTarget;
  newValue: string;
}

export interface DEStepUpdate {
  stepId: string;
  content: DEStepContent;
  status?: StepStatus;
}

export interface MockChatResponse {
  text: string;
  edits?: EditAction[];
  deStepUpdate?: DEStepUpdate;
}
