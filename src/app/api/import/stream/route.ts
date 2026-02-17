import { Subconscious } from "subconscious";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { DE_STEP_TITLES } from "@/types/de-framework";
import { parseOrbitPaste } from "@/lib/parseOrbitPaste";
import { NextRequest } from "next/server";
import { SUBCONSCIOUS_ENGINE, SYSTEM_PROMPT, buildTools, summarizeContent, extractThoughts } from "@/lib/agent-config";

// ── SSE streaming endpoint for import processing ──

export async function POST(req: NextRequest) {
  const { reportId, pasteText, stepNumber } = (await req.json()) as {
    reportId: string;
    pasteText: string;
    stepNumber: number;
  };

  // Parse context steps from the paste for clearer AI instructions
  const parsed = parseOrbitPaste(pasteText);

  const subconsciousApiKey = process.env.SUBCONSCIOUS_API_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const toolSecret = process.env.TOOL_ENDPOINT_SECRET;

  if (!subconsciousApiKey || !convexUrl || !convexSiteUrl || !toolSecret) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Set up Convex client for fetching context
  const convex = new ConvexHttpClient(convexUrl);

  // Fetch all steps with full content for document awareness
  const steps = await convex.query(api.deSteps.getSteps, {
    reportId: reportId as Id<"reports">,
  });

  // Build rich document state — the AI sees what's already in the report
  const documentState = steps
    .filter((s: { status: string }) => s.status !== "not_started")
    .map((s: { number: number; title: string; status: string; headline?: string; content: Record<string, unknown> }) => {
      const statusLabel = s.status === "complete" ? "COMPLETE" : "IN PROGRESS";
      const headline = s.headline ? `\nHeadline: ${s.headline}` : "";
      const contentSummary = summarizeContent(s.content);
      return `### Step ${s.number} — ${s.title} [${statusLabel}]${headline}\n${contentSummary}`;
    })
    .join("\n\n");

  // Build context from parsed steps + DB headlines
  const parsedContextStr = parsed.contextSteps
    .map((cs) => `${cs.stepNumber} - ${DE_STEP_TITLES[cs.stepNumber - 1]}: ${cs.headline}`)
    .join("\n");

  const targetTitle = DE_STEP_TITLES[stepNumber - 1];

  // Build user message with explicit target step
  const userMessage = `Here is data copied from the MIT Orbit platform. The target step is step_${stepNumber} (${targetTitle}).

## Already Completed Steps (context only — do NOT update these)
${parsedContextStr || "None yet."}

## Instructions — follow this exact order
1. Call list_steps first to understand current state
2. Use fast_search to research key claims, market data, and frameworks relevant to step ${stepNumber}. Search for real industry reports, academic papers, market sizing data. Note the URLs you find.
3. Reconstruct the pasted data into the correct content type for step ${stepNumber}. Include ALL rows, ALL criteria, ALL data points. Do NOT summarize or truncate. ENRICH with deeper analysis.
4. Embed inline citation references [1], [2], [3] etc. inside the cell values, text, or descriptions wherever a claim is backed by a source you found. Number sequentially from 1.
5. Call update_step for step_${stepNumber} with status "complete" — the content must contain the [N] references.
6. Call add_citation for each reference IN ORDER (citation 1 first, then 2, etc.) with stepId "step_${stepNumber}". Each MUST have a real URL from your search results.
7. Call propose_headlines for step_${stepNumber}

## Raw Orbit Data

${pasteText}`;

  const instructions = `${SYSTEM_PROMPT}

## Current Document State
${documentState || "No steps have been started yet."}

## Current User Message
${userMessage}`;

  // Build tools
  const tools = buildTools(convexSiteUrl, reportId, toolSecret);

  // Set up Subconscious client
  const client = new Subconscious({
    apiKey: subconsciousApiKey,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = client.stream({
          engine: SUBCONSCIOUS_ENGINE,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input: { instructions, tools: tools as any },
        });

        let fullContent = "";
        let lastSentThoughts: string[] = [];

        for await (const event of stream) {
          if (event.type === "delta") {
            fullContent += event.content;

            // Extract and send new thoughts
            const thoughts = extractThoughts(fullContent);
            const newThoughts = thoughts.filter(
              (t) => !lastSentThoughts.includes(t),
            );

            for (const thought of newThoughts) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "thought", thought })}\n\n`,
                ),
              );
              lastSentThoughts.push(thought);
            }
          } else if (event.type === "done") {
            // Import complete — no need to save to chat
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "complete" })}\n\n`,
              ),
            );

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } else if (event.type === "error") {
            const errorMessage = event.message || "Unknown streaming error";

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`,
              ),
            );
            controller.close();
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`,
          ),
        );
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
