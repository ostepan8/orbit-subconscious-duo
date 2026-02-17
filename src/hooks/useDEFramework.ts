"use client";

import { useReducer, useCallback } from "react";
import type { DEStep, DEStepContent } from "@/types/de-framework";

// ── State ───────────────────────────────────────────────────────────

export interface DEFrameworkState {
  steps: DEStep[];
  highlights: Record<string, number>;
}

// ── Actions ─────────────────────────────────────────────────────────

type Action =
  | { type: "UPDATE_STEP"; stepId: string; content: DEStepContent; status?: DEStep["status"] }
  | { type: "CLEAR_HIGHLIGHT"; key: string };

function reducer(state: DEFrameworkState, action: Action): DEFrameworkState {
  switch (action.type) {
    case "UPDATE_STEP": {
      const highlights = { ...state.highlights };
      highlights[`de_step:${action.stepId}`] = Date.now();

      return {
        ...state,
        steps: state.steps.map((s) =>
          s.id === action.stepId
            ? { ...s, content: action.content, status: action.status ?? s.status }
            : s,
        ),
        highlights,
      };
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

export function useDEFramework(initialSteps: DEStep[]) {
  const [state, dispatch] = useReducer(reducer, {
    steps: initialSteps,
    highlights: {},
  });

  const updateStep = useCallback(
    (stepId: string, content: DEStepContent, status?: DEStep["status"]) => {
      dispatch({ type: "UPDATE_STEP", stepId, content, status });
    },
    [],
  );

  const clearHighlight = useCallback((key: string) => {
    dispatch({ type: "CLEAR_HIGHLIGHT", key });
  }, []);

  return { state, updateStep, clearHighlight };
}
