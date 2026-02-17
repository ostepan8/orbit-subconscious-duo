import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Step titles (same as DE_STEP_TITLES in src/types/de-framework.ts) ──

const DE_STEP_TITLES = [
  "Market Segmentation",
  "Beachhead Market",
  "End User Profile",
  "Beachhead TAM Size",
  "Persona",
  "Life Cycle Use Case",
  "High-Level Specs",
  "Quantify Value Proposition",
  "Next 10 Customers",
  "Define Core",
  "Chart Competitive Position",
  "Determine DMU",
  "Map Customer Acquisition Process",
  "Follow-on TAM",
  "Design Business Model",
  "Pricing Framework",
  "LTV (Life-Time Value)",
  "Map Sales Process",
  "COCA (Cost of Customer Acquisition)",
  "Identify Key Assumptions",
  "Test Key Assumptions",
  "Define MVBP",
  "Show Dogs Will Eat Dog Food",
  "Develop Product Plan",
];

// ── Seed blank report from paste (AI agent will fill in steps) ──

export const seedFromPaste = mutation({
  args: {
    title: v.string(),
    contextSteps: v.optional(
      v.array(v.object({ stepNumber: v.number(), headline: v.string() }))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const externalId = `paste_${Date.now()}`;

    const reportId = await ctx.db.insert("reports", {
      externalId,
      title: args.title,
      summary: "Report being populated by AI agent...",
      createdAt: Date.now(),
      userId,
    });

    // Build a map of pre-parsed headlines from context lines
    const headlineMap = new Map<number, string>();
    if (args.contextSteps) {
      for (const cs of args.contextSteps) {
        headlineMap.set(cs.stepNumber, cs.headline);
      }
    }

    // Create DE steps — pre-populate headlines for context steps
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      const stepNum = i + 1;
      const headline = headlineMap.get(stepNum);
      await ctx.db.insert("deSteps", {
        reportId,
        stepId: `step_${stepNum}`,
        number: stepNum,
        title: DE_STEP_TITLES[i],
        status: headline ? "in_progress" : "not_started",
        content: { type: "text", body: headline ? `Context from Orbit: ${headline}` : "Awaiting AI agent..." },
        headline: headline,
        updatedAt: now,
      });
    }

    // Welcome message
    await ctx.db.insert("chatMessages", {
      reportId,
      role: "assistant",
      content:
        "I'm ready to analyze your Orbit workbook data. Processing now...",
      timestamp: now,
    });

    return { reportId, externalId };
  },
});

// ── Create blank report from dashboard ──

export const createBlankReport = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const externalId = `report_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const reportId = await ctx.db.insert("reports", {
      externalId,
      title: args.title,
      summary: "New startup idea — use the AI agent to populate your DE framework steps.",
      createdAt: Date.now(),
      userId,
    });

    // Seed the 24 DE step stubs
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      const stepNum = i + 1;
      await ctx.db.insert("deSteps", {
        reportId,
        stepId: `step_${stepNum}`,
        number: stepNum,
        title: DE_STEP_TITLES[i],
        status: "not_started",
        content: { type: "text", body: "Awaiting AI agent..." },
        updatedAt: now,
      });
    }

    // Welcome message
    await ctx.db.insert("chatMessages", {
      reportId,
      role: "assistant",
      content:
        "I'm your DE framework advisor. Ask me to generate, refine, or review any of the 24 steps — or paste data from Orbit to import it.",
      timestamp: now,
    });

    return { reportId, externalId };
  },
});
