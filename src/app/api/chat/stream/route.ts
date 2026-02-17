import { Subconscious } from "subconscious";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { NextRequest } from "next/server";
import { SUBCONSCIOUS_ENGINE, SYSTEM_PROMPT, buildTools, summarizeContent, extractThoughts } from "@/lib/agent-config";

// ── SSE streaming endpoint ──

export async function POST(req: NextRequest) {
  const { reportId, message } = (await req.json()) as {
    reportId: string;
    message: string;
  };

  const subconsciousApiKey = process.env.SUBCONSCIOUS_API_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const toolSecret = process.env.TOOL_ENDPOINT_SECRET;
  const saveMessageSecret = process.env.SAVE_MESSAGE_SECRET;

  if (!subconsciousApiKey || !convexUrl || !convexSiteUrl || !toolSecret || !saveMessageSecret) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Set up Convex client for saving messages
  const convex = new ConvexHttpClient(convexUrl);

  // Fetch recent conversation history
  const messages = await convex.query(api.chat.getMessages, {
    reportId: reportId as Id<"reports">,
  });

  const recentHistory = messages
    .slice(-30)
    .map(
      (m: { role: string; content: string }) =>
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
    )
    .join("\n\n");

  // Fetch all steps with full content for document awareness
  const steps = await convex.query(api.deSteps.getSteps, {
    reportId: reportId as Id<"reports">,
  });

  // Build rich document state — the AI sees exactly what the user sees
  const documentState = steps
    .filter((s: { status: string }) => s.status !== "not_started")
    .map((s: { number: number; title: string; status: string; headline?: string; content: Record<string, unknown> }) => {
      const statusLabel = s.status === "complete" ? "COMPLETE" : "IN PROGRESS";
      const headline = s.headline ? `\nHeadline: ${s.headline}` : "";
      const contentSummary = summarizeContent(s.content);
      return `### Step ${s.number} — ${s.title} [${statusLabel}]${headline}\n${contentSummary}`;
    })
    .join("\n\n");

  const notStarted = steps
    .filter((s: { status: string }) => s.status === "not_started")
    .map((s: { number: number; title: string }) => `${s.number} - ${s.title}`)
    .join(", ");

  // Build instructions
  const instructions = `${SYSTEM_PROMPT}

## Current Document State
The user can see all of this content in their report right now. Reference it directly when answering questions.

${documentState || "No steps have been started yet."}

${notStarted ? `\nNot started: ${notStarted}` : ""}

## Conversation History
${recentHistory}

## Current User Message
${message}`;

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
        const stream = client.stream(
          {
            engine: SUBCONSCIOUS_ENGINE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            input: { instructions, tools: tools as any },
          },
        );

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
            // Parse final answer
            let answer = "";
            try {
              const final = JSON.parse(fullContent);
              answer =
                typeof final.answer === "string"
                  ? final.answer
                  : JSON.stringify(final.answer);
            } catch {
              // Fallback: try to extract answer field with regex
              const answerMatch = fullContent.match(
                /"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/,
              );
              if (answerMatch) {
                answer = answerMatch[1]
                  .replace(/\\n/g, "\n")
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, "\\");
              } else {
                answer =
                  "I processed your request. The changes should be visible in the document.";
              }
            }

            // Save assistant message to Convex
            await convex.mutation(api.chat.saveMessage, {
              reportId: reportId as Id<"reports">,
              role: "assistant",
              content: answer,
              secret: saveMessageSecret,
            });

            // Send answer event
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "answer", answer })}\n\n`,
              ),
            );

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } else if (event.type === "error") {
            const errorMessage = event.message || "Unknown streaming error";

            // Save error message to Convex
            await convex.mutation(api.chat.saveMessage, {
              reportId: reportId as Id<"reports">,
              role: "assistant",
              content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
              secret: saveMessageSecret,
            });

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

        // Save error message to Convex
        try {
          await convex.mutation(api.chat.saveMessage, {
            reportId: reportId as Id<"reports">,
            role: "assistant",
            content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
            secret: saveMessageSecret,
          });
        } catch {
          // Ignore save errors during error handling
        }

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
