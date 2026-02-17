"use client";

import { useReducer, useCallback } from "react";
import type { ResearchResult, EditAction, EditTarget } from "@/types";

// ── Helpers ─────────────────────────────────────────────────────────

export function editTargetToKey(target: EditTarget): string {
  switch (target.type) {
    case "title":
      return "title";
    case "summary":
      return "summary";
    case "citation":
      return `citation:${target.citationId}:${target.field}`;
    case "recommendation":
      return `recommendation:${target.recommendationId}:${target.field}`;
    case "de_step":
      return `de_step:${target.stepId}`;
  }
}

// ── State ───────────────────────────────────────────────────────────

export interface ReportEditorState {
  report: ResearchResult;
  highlights: Record<string, number>; // key → timestamp
  version: number; // increments on AI edits (for contentEditable re-mount)
}

// ── Actions ─────────────────────────────────────────────────────────

type Action =
  | { type: "UPDATE_TITLE"; value: string }
  | { type: "UPDATE_SUMMARY"; value: string }
  | { type: "UPDATE_CITATION"; citationId: string; field: "text" | "source"; value: string }
  | { type: "UPDATE_RECOMMENDATION"; recommendationId: string; field: "title" | "description"; value: string }
  | { type: "APPLY_EDITS"; edits: EditAction[] }
  | { type: "CLEAR_HIGHLIGHT"; key: string };

function applyEditToReport(report: ResearchResult, edit: EditAction): ResearchResult {
  const { target, newValue } = edit;
  switch (target.type) {
    case "title":
      return { ...report, title: newValue };
    case "summary":
      return { ...report, summary: newValue };
    case "citation":
      return {
        ...report,
        citations: report.citations.map((c) =>
          c.id === target.citationId ? { ...c, [target.field]: newValue } : c,
        ),
      };
    case "recommendation":
      return {
        ...report,
        recommendations: report.recommendations.map((r) =>
          r.id === target.recommendationId ? { ...r, [target.field]: newValue } : r,
        ),
      };
    case "de_step":
      // DE step edits are handled by useDEFramework, not here
      return report;
  }
}

function reducer(state: ReportEditorState, action: Action): ReportEditorState {
  switch (action.type) {
    case "UPDATE_TITLE":
      return { ...state, report: { ...state.report, title: action.value } };

    case "UPDATE_SUMMARY":
      return { ...state, report: { ...state.report, summary: action.value } };

    case "UPDATE_CITATION":
      return {
        ...state,
        report: {
          ...state.report,
          citations: state.report.citations.map((c) =>
            c.id === action.citationId ? { ...c, [action.field]: action.value } : c,
          ),
        },
      };

    case "UPDATE_RECOMMENDATION":
      return {
        ...state,
        report: {
          ...state.report,
          recommendations: state.report.recommendations.map((r) =>
            r.id === action.recommendationId ? { ...r, [action.field]: action.value } : r,
          ),
        },
      };

    case "APPLY_EDITS": {
      let report = state.report;
      const highlights = { ...state.highlights };
      const now = Date.now();

      for (const edit of action.edits) {
        report = applyEditToReport(report, edit);
        highlights[editTargetToKey(edit.target)] = now;
      }

      return { ...state, report, highlights, version: state.version + 1 };
    }

    case "CLEAR_HIGHLIGHT": {
      const highlights = { ...state.highlights };
      delete highlights[action.key];
      return { ...state, highlights };
    }

    default:
      return state;
  }
}

// ── Hook ────────────────────────────────────────────────────────────

export function useReportEditor(initialReport: ResearchResult) {
  const [state, dispatch] = useReducer(reducer, {
    report: initialReport,
    highlights: {},
    version: 0,
  });

  const updateTitle = useCallback((value: string) => {
    dispatch({ type: "UPDATE_TITLE", value });
  }, []);

  const updateSummary = useCallback((value: string) => {
    dispatch({ type: "UPDATE_SUMMARY", value });
  }, []);

  const updateCitation = useCallback(
    (citationId: string, field: "text" | "source", value: string) => {
      dispatch({ type: "UPDATE_CITATION", citationId, field, value });
    },
    [],
  );

  const updateRecommendation = useCallback(
    (recommendationId: string, field: "title" | "description", value: string) => {
      dispatch({ type: "UPDATE_RECOMMENDATION", recommendationId, field, value });
    },
    [],
  );

  const applyEdits = useCallback((edits: EditAction[]) => {
    dispatch({ type: "APPLY_EDITS", edits });
  }, []);

  const clearHighlight = useCallback((key: string) => {
    dispatch({ type: "CLEAR_HIGHLIGHT", key });
  }, []);

  const isHighlighted = useCallback(
    (target: EditTarget): boolean => {
      return editTargetToKey(target) in state.highlights;
    },
    [state.highlights],
  );

  return {
    state,
    updateTitle,
    updateSummary,
    updateCitation,
    updateRecommendation,
    applyEdits,
    clearHighlight,
    isHighlighted,
  };
}
