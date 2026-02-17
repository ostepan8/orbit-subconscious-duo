import { query, mutation, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SUBCONSCIOUS_ENGINE } from "./constants";

// ── Queries ──

export const getMessages = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return [];
    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) return [];

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});

// ── Mutations ──

// Client-side mutation — authenticated user saves their own message
export const saveUserMessage = mutation({
  args: {
    reportId: v.id("reports"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const report = await ctx.db.get(args.reportId);
    if (!report || report.userId !== userId) throw new Error("Not authorized");
    return await ctx.db.insert("chatMessages", {
      reportId: args.reportId,
      role: "user",
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

// Server-side mutation — called from Next.js API routes with shared secret
export const saveMessage = mutation({
  args: {
    reportId: v.id("reports"),
    role: v.string(),
    content: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.secret !== process.env.SAVE_MESSAGE_SECRET) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.insert("chatMessages", {
      reportId: args.reportId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

// Delete a message and all messages after it (for edit-and-rewind)
export const deleteMessagesFrom = mutation({
  args: {
    reportId: v.id("reports"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const report = await ctx.db.get(args.reportId);
    if (!report || report.userId !== userId) throw new Error("Not authorized");

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();

    const toDelete = messages.filter((m) => m.timestamp >= args.timestamp);
    for (const m of toDelete) {
      await ctx.db.delete(m._id);
    }
    return { deleted: toDelete.length };
  },
});

export const addMessage = internalMutation({
  args: {
    reportId: v.id("reports"),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      reportId: args.reportId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

// ── System prompt ──

const SYSTEM_PROMPT = `You are an expert advisor on Bill Aulet's 24 Steps of Disciplined Entrepreneurship from MIT. You are embedded in a document editor helping an entrepreneur build their DE workbook for the Orbit Jetpack venture.

## Your Tools
- **fast_search** (platform): Extremely fast search for simple factual lookups. Use this BEFORE adding citations to find real, verifiable URLs.
- list_steps: See all 24 steps and their statuses. ALWAYS call this first.
- read_step: Read full content of a specific step.
- update_step: Generate or refine content for a step.
- propose_headlines: After updating a step, propose 2-3 headline options for the user to select.
- read_report: See the report summary, citations, and recommendations.
- update_report: Edit report fields (title, summary).
- add_citation: Add a research citation with a real URL from search results.
- add_recommendation: Propose an actionable recommendation for the user to accept or reject.

## Workflow — ALWAYS EXECUTE, NEVER JUST DESCRIBE
You are a TOOL-CALLING agent. Your job is to USE your tools to make real-time changes to the document. The user sees updates live in their UI as you call tools.

**CRITICAL RULE: NEVER just describe or summarize what you found. ALWAYS call the tools to write changes into the document.**
- After researching → call update_step to write enriched content with [N] citation refs
- After update_step → call add_citation for each source (with real URLs)
- After add_citation → call propose_headlines
- If you don't call update_step, the user sees NOTHING change — your research is wasted

**Execution order for EVERY request:**
1. Call list_steps to understand current state
2. Call read_step to examine the target step(s)
3. Use fast_search to research claims and find real source URLs
4. Call update_step with enriched content containing inline [N] citation references
5. Call add_citation for each [N] reference with a real URL from search results
6. Call propose_headlines for the updated step
7. THEN provide a brief conversational summary of what you changed

If you skip steps 4-6, you have FAILED the task. Research alone is not enough — you must write the results into the document.

## Content Type Rules
Each step's content must be one of these JSON types:
- **table**: { type: "table", label?: string, headers: string[], rows: Record<string, string>[] } — For comparisons, segmentation grids
- **profile**: { type: "profile", label?: string, sections: { label: string, value: string }[] } — For personas, user profiles
- **text**: { type: "text", label?: string, body: string } — For narratives, rationale, use cases
- **metrics**: { type: "metrics", label?: string, items: { label: string, value: string, explanation?: string }[] } — For TAM, financial data
- **multi**: { type: "multi", blocks: [ ...array of table/profile/text/metrics blocks... ] } — For steps with MULTIPLE tables, sections, or mixed content. Each block has its own type and optional label.

## WHEN TO USE MULTI — CRITICAL
Use the **multi** content type when the source data contains MORE THAN ONE distinct content block (multiple tables, multiple profiles, mixed types). Examples:
- Step 3 (End User Profile) with End User Profile table + Economic Buyer Profile table → multi with 2 profile blocks
- Step 4 (Beachhead TAM) with Top-Down, Budget, Comparables, and Summary tables → multi with 4+ table blocks
- Any step with a main table PLUS analysis text PLUS additional metrics → multi
- If the paste has "Table 1:", "Table 2:", or multiple distinct grids → ALWAYS use multi
Do NOT cram multiple tables into a single table. Do NOT drop content to fit a single block. Use multi to preserve ALL content.

IMPORTANT: Each block inside multi must use the CORRECT type for its data:
- ANY data with rows and columns (including Category/Details pairs) → use **table** blocks
- Key numbers with explanations → use **metrics** blocks
- Narrative paragraphs → use **text** blocks
NEVER dump structured/tabular data into text or profile blocks. If the source shows rows and columns, it MUST be a table block.

## Recommended Content Type Per Step
- Step 1 (Market Segmentation): table
- Step 2 (Beachhead Market): table
- Step 3 (End User Profile): multi (End User table with headers ["Category","Details"] + Economic Buyer table with headers ["Category","Details"] + summary text block)
- Step 4 (Beachhead TAM): multi (multiple estimation tables + summary metrics + analysis text)
- Step 5 (Persona): profile
- Step 6 (Life Cycle Use Case): text
- Step 7 (High-Level Specs): table
- Step 8 (Quantify Value Proposition): metrics
- Step 9 (Next 10 Customers): table
- Step 10 (Define Core): text
- Step 11 (Chart Competitive Position): table
- Step 12 (Determine DMU): profile
- Step 13 (Map Customer Acquisition Process): text
- Step 14 (Follow-on TAM): metrics
- Step 15 (Design Business Model): text
- Step 16 (Pricing Framework): metrics
- Step 17 (LTV): metrics
- Step 18 (Map Sales Process): text
- Step 19 (COCA): metrics
- Step 20 (Identify Key Assumptions): table
- Step 21 (Test Key Assumptions): table
- Step 22 (Define MVBP): text
- Step 23 (Show Dogs Will Eat Dog Food): text
- Step 24 (Develop Product Plan): text

## Quality Standards
- PRESERVE ORDER: The output MUST follow the exact same order as the pasted data. If the paste has tables, sections, or rows in a specific sequence, your output must mirror that sequence exactly. Do not reorder rows, rearrange sections, or alphabetize. The user expects to see their data in the same layout as Orbit.
- Tables: The longer dimension ALWAYS goes vertical (as rows). Count the items on each axis — whichever has more becomes rows. For Market Segmentation with 5 segments and 10+ criteria: criteria are ROWS, segments are COLUMNS. Never put 10 criteria as columns — that causes horizontal scrolling. If columns have long text values, reduce column count by splitting into multiple tables or transposing.
- Profiles: 4-8 sections with detailed descriptions (50-150 words each)
- Text: 200-500 words with clear structure
- Metrics: 4-8 items with labels, values, and explanations
- CRITICAL: Preserve ALL data from the source. Include every row, every criterion, and every detail. Do NOT summarize, truncate, or drop any data points. ENRICH the data — add context, deeper analysis, and research-backed insights beyond what was provided. Keep the original structure and ordering.

## Orbit Data Import — CRITICAL RULES
When the user pastes raw data from the MIT Orbit platform:
- Each paste contains detailed content for exactly ONE step. Do NOT generate or update any other steps.
- Paste format:
  1. "Startup idea name is: ..." (title)
  2. "N - Step Title: headline" lines (context from previous steps — READ ONLY, do NOT update these)
  3. One step's detailed content block (paragraphs, tables, evaluation grids)
- Identify which step has the detailed content block and ONLY call update_step for THAT step
- The "N - Title: headline" context lines at the top tell you what was decided in prior steps. Use them to inform your work but do NOT call update_step or propose_headlines for them.
- Table data is flattened (each cell on its own line). Reconstruct into the correct content type.
- FORMAT OVERRIDE: If the pasted data contains ANY tabular structure (rows/columns, Category/Details pairs, evaluation matrices, grids), ALWAYS use the **table** content type. Tables render as actual charts with headers and rows — this matches Orbit's layout. Do NOT convert tables into profile cards or text paragraphs. Most Orbit steps include tables — preserve them as tables.
- CRITICAL: Include ALL rows and ALL columns from the original data. Do not drop any criteria, segments, or evaluation dimensions. The output table must have the same number of data points as the input. ENRICH the data with additional context and analysis.
- CITATIONS WORKFLOW — follow this exact order:
  1. FIRST use fast_search to research key claims, market data, and frameworks relevant to the step content
  2. Note the sources and URLs you find
  3. THEN call update_step with content that embeds inline citation references like [1], [2], [3] in the cell values, text, or descriptions wherever a claim is supported by a source. Number them sequentially starting from 1.
  4. THEN call add_citation for each reference IN THE SAME ORDER as the numbers in the content. Citation #1 in add_citation matches [1] in the content, #2 matches [2], etc.
  5. Each citation MUST have a real URL from your search results. NEVER hallucinate URLs or sources. Only cite pages you actually found via search.
  Example table cell: "High: R&D organizations typically have funding for new technologies [1]. Federal R&D spending exceeded $180B in 2024 [2]."
  Example text: "The drone market is projected to reach $54.6B by 2030 [1], with consumer segments growing at 13.8% CAGR [2]."
- Call propose_headlines for ONLY the one step you updated
- Do NOT invent content for steps not in the paste

## Headline Rules — CRITICAL
After calling update_step, ALWAYS call propose_headlines.
Headlines must be LITERAL and TERSE. No prose, no "Here are:", no "5 segments:", no descriptions after colons. Just the raw items or names.

### SUMMARY steps (list/table — one correct answer, propose exactly 1 option):
Steps 1, 7, 9, 11, 20, 21
These list multiple things. The headline is ALL items comma-separated. Propose exactly 1 option (it auto-selects).
Step 1 example: propose_headlines with options=["Tech Enthusiasts, Adventure Sports, Education, R&D, Military & Defense"]
WRONG: "5 potential user segments: Tech, Sports..." or "Market spans tech lovers to defense agencies"
RIGHT: "Tech Enthusiasts, Adventure Sports, Education, R&D, Military & Defense"

### CHOICE steps (user picks one path — propose 2-3 competing options):
Steps 2, 3, 5, 10, 12, 15, 22
Each option must be a SINGLE item name/label. No explanations, no comma-separated lists.
Step 2 (Beachhead Market): Each option is ONE segment name from Step 1. The user will pick which segment becomes their beachhead. Do NOT list all segments in one option — that defeats the purpose.
Step 2 example: ["Tech Enthusiasts", "Adventure Sports Participants", "Educational Institutions"]
WRONG: "Retail Delivery Services, Food and Beverage Delivery, Medical Supply Delivery" (this is a list, not a choice)
WRONG: "Adventure Sports Participants: High urgency, early adoption, and influencer-driven growth"
RIGHT: "Adventure Sports Participants"

### ANALYSIS steps (key finding — propose exactly 1 option):
Steps 4, 6, 8, 13, 14, 16, 17, 18, 19, 23, 24
Just the core number or fact. Propose exactly 1 option (it auto-selects).
Step 4 example: ["$400M TAM, 15% CAGR, 2-year path to 20% share"]
WRONG: "The total addressable market is estimated at $400M"
RIGHT: "$400M TAM, 15% CAGR, 2-year path to 20% share"

## Step-Specific Instructions
When working on a specific step, follow these detailed instructions in addition to the general rules above.

### Step 3 — End User Profile
**Content format:** Use multi with labeled table blocks. The Orbit data typically contains two Category/Details tables:
1. "End User Profile" table — label: "End User Profile for [Beachhead Market]", headers: ["Category", "Details"], rows: Demographics, Psychographics, Proxy Products, Watering Holes, Day in the Life, Priorities
2. "Economic Buyer Profile" table — label: "Economic Buyer Profile for [Beachhead Market]", headers: ["Category", "Details"], same row categories
3. Optional summary text block at the end

**Headline override (ignore CHOICE rule above for Step 3):** Propose 2-3 descriptive options that summarize the END USER archetype — not just a name, but who they are. Include age range, key trait, and motivation. 15-25 words each.
Example options:
- "Urban Tech Influencer, 25-35 — early adopter who shares new gadgets with their community"
- "Young Professional Engineer, 28-40 — performance-driven builder seeking cutting-edge tools"
- "Tech-Savvy Content Creator, 22-32 — reviews and showcases emerging tech for large audiences"
Each option should represent a distinct persona direction the user could pursue. Ground them in the actual data from the paste.

## Recommendations
When you identify actionable next steps, strategic advice, or improvements, use **add_recommendation** to create a recommendation card. The user will see it in the UI with Accept/Reject buttons. When they accept, you'll receive a follow-up message asking you to help implement it — use the appropriate tools to make the changes.

## Important
- ALWAYS call update_step, add_citation, and propose_headlines — never just talk about what you would do
- Provide a brief conversational response AFTER making tool calls, explaining what changed
- You can update multiple steps in one interaction
- Base new content on the venture context and previously completed steps
- The framework is sequential — later steps build on earlier ones`;

// ── Build tool definitions ──

function buildTools(convexSiteUrl: string, reportId: string, toolSecret: string) {
  const reportIdProp = {
    type: "string" as const,
    description: "The report ID",
  };
  const s = `?secret=${toolSecret}`;

  return [
    // Platform search — gives the agent real web search for citations
    {
      type: "platform" as const,
      id: "fast_search",
    },
    {
      type: "function" as const,
      name: "list_steps",
      description:
        "Get the index of all 24 DE framework steps with titles, numbers, and statuses. ALWAYS call this first.",
      url: `${convexSiteUrl}/tools/list-steps${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: { reportId: reportIdProp },
        required: [] as string[],
        additionalProperties: false,
      },

      defaults: { reportId },
    },
    {
      type: "function" as const,
      name: "read_step",
      description:
        "Read the full content of a specific DE framework step by its stepId (e.g. step_1).",
      url: `${convexSiteUrl}/tools/read-step${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: {
          reportId: reportIdProp,
          stepId: {
            type: "string" as const,
            description: "Step identifier, e.g. step_1 through step_24",
          },
        },
        required: ["stepId"],
        additionalProperties: false,
      },
      defaults: { reportId },
    },
    {
      type: "function" as const,
      name: "update_step",
      description:
        'Update a DE step. Pass stepId, status (not_started|in_progress|complete), and content as a JSON string. Content format depends on type: table={"type":"table","label":"...","headers":[...],"rows":[{...}]}, profile={"type":"profile","sections":[{"label":"...","value":"..."}]}, text={"type":"text","body":"..."}, metrics={"type":"metrics","items":[{"label":"...","value":"...","explanation":"..."}]}, multi={"type":"multi","blocks":[...array of table/text/metrics/profile blocks...]}. Use multi when a step has multiple tables or mixed content sections.',
      url: `${convexSiteUrl}/tools/update-step${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: {
          reportId: reportIdProp,
          stepId: { type: "string" as const, description: "e.g. step_1" },
          status: { type: "string" as const, description: "not_started, in_progress, or complete" },
          content: { type: "string" as const, description: "JSON string of the content object" },
        },
        required: ["stepId", "content"],
        additionalProperties: false,
      },
      defaults: { reportId },
    },
    {
      type: "function" as const,
      name: "read_report",
      description:
        "Read the report title, summary, citations, and recommendations.",
      url: `${convexSiteUrl}/tools/read-report${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: { reportId: reportIdProp },
        required: [] as string[],
        additionalProperties: false,
      },
      defaults: { reportId },
    },
    {
      type: "function" as const,
      name: "update_report",
      description: "Update a report field (title or summary).",
      url: `${convexSiteUrl}/tools/update-report${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: {
          reportId: reportIdProp,
          field: { type: "string" as const, description: "title or summary" },
          value: { type: "string" as const, description: "The new value" },
        },
        required: ["field", "value"],
        additionalProperties: false,
      },
      defaults: { reportId },
    },
    {
      type: "function" as const,
      name: "add_citation",
      description:
        "Add a research citation backed by a real URL from search results. ONLY call this after using fast_search to find the source. Every citation must link to a real, viewable webpage.",
      url: `${convexSiteUrl}/tools/add-citation${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: {
          reportId: reportIdProp,
          text: {
            type: "string" as const,
            description: "The key finding or claim from this source (1-2 sentences)",
          },
          source: {
            type: "string" as const,
            description:
              "Full name of the source (e.g. 'Grand View Research - Drone Market Report 2025', 'MIT Sloan Management Review')",
          },
          url: {
            type: "string" as const,
            description: "The real URL where the user can read this source. REQUIRED — must be a real URL from your search results.",
          },
          relevanceScore: {
            type: "number" as const,
            description: "Relevance score from 0.0 to 1.0 (default 0.8)",
          },
          stepId: {
            type: "string" as const,
            description:
              "The step this citation supports (e.g. step_1). Always provide this to link citations to the relevant step.",
          },
        },
        required: ["text", "source", "url"],
        additionalProperties: false,
      },
      defaults: { reportId },
    },
    {
      type: "function" as const,
      name: "add_recommendation",
      description:
        "Add an actionable recommendation for the user. It will appear as a pending card they can accept or reject. Use this to suggest next steps, strategic actions, or improvements based on the analysis.",
      url: `${convexSiteUrl}/tools/add-recommendation${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: {
          reportId: reportIdProp,
          title: {
            type: "string" as const,
            description: "Short title for the recommendation (5-10 words)",
          },
          description: {
            type: "string" as const,
            description: "Detailed description of what the user should do and why (2-4 sentences)",
          },
          priority: {
            type: "string" as const,
            description: "Priority level: high, medium, or low",
          },
          category: {
            type: "string" as const,
            description: "Category like 'market research', 'product', 'strategy', 'financial', 'team'",
          },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
      defaults: { reportId },
    },
    {
      type: "function" as const,
      name: "propose_headlines",
      description:
        "After updating a step, propose 2-3 short headline options (5-15 words each) for the user to select as the key takeaway. Headlines should capture the main choice or answer.",
      url: `${convexSiteUrl}/tools/propose-headlines${s}`,
      method: "POST" as const,
      timeout: 15,
      parameters: {
        type: "object" as const,
        properties: {
          reportId: reportIdProp,
          stepId: { type: "string" as const, description: "e.g. step_1" },
          options: {
            type: "string" as const,
            description:
              'JSON array of 2-3 headline strings, e.g. ["Tech Enthusiasts aged 25-40", "Adventure Sports market"]',
          },
        },
        required: ["stepId", "options"],
        additionalProperties: false,
      },
      defaults: { reportId },
    },
  ];
}

// ── Content summarizer — gives the AI visibility into what's on screen ──
// NOTE: Keep in sync with src/lib/agent-config.ts summarizeContent

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function summarizeContent(content: any): string {
  if (!content || !content.type) return "(empty)";

  if (content.type === "table") {
    const headers = content.headers?.join(" | ") || "";
    const rowCount = content.rows?.length || 0;
    const label = content.label ? `${content.label}: ` : "";
    const preview = (content.rows || []).slice(0, 3).map((row: Record<string, string>) =>
      content.headers.map((h: string) => row[h] || "—").join(" | ")
    ).join("\n");
    const more = rowCount > 3 ? `\n... and ${rowCount - 3} more rows` : "";
    return `${label}Table (${rowCount} rows): ${headers}\n${preview}${more}`;
  }

  if (content.type === "text") {
    const label = content.label ? `${content.label}: ` : "";
    const body = content.body || "";
    return `${label}${body.length > 500 ? body.slice(0, 500) + "..." : body}`;
  }

  if (content.type === "metrics") {
    const label = content.label ? `${content.label}: ` : "";
    const items = (content.items || []).map((i: { label: string; value: string }) => `${i.label}: ${i.value}`).join("; ");
    return `${label}Metrics: ${items}`;
  }

  if (content.type === "profile") {
    const label = content.label ? `${content.label}: ` : "";
    const sections = (content.sections || []).map((s: { label: string; value: string }) =>
      `${s.label}: ${s.value.length > 100 ? s.value.slice(0, 100) + "..." : s.value}`
    ).join("\n");
    return `${label}Profile:\n${sections}`;
  }

  if (content.type === "multi") {
    return (content.blocks || []).map((block: Record<string, unknown>) => summarizeContent(block)).join("\n\n");
  }

  return JSON.stringify(content).slice(0, 300);
}

// ── Main chat action ──

export const sendChatMessage = action({
  args: {
    reportId: v.id("reports"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Save user message
    await ctx.runMutation(internal.chat.addMessage, {
      reportId: args.reportId,
      role: "user",
      content: args.message,
    });

    // 2. Get conversation history for context
    const messages = await ctx.runQuery(api.chat.getMessages, {
      reportId: args.reportId,
    });

    const recentHistory = messages
      .slice(-30)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    // 3. Fetch all steps with full content for document awareness
    const steps = await ctx.runQuery(api.deSteps.getSteps, {
      reportId: args.reportId,
    });

    // Build rich document state — the AI sees exactly what the user sees
    const documentState = steps
      .filter((s) => s.status !== "not_started")
      .map((s) => {
        const statusLabel = s.status === "complete" ? "COMPLETE" : "IN PROGRESS";
        const headline = s.headline ? `\nHeadline: ${s.headline}` : "";
        const contentSummary = summarizeContent(s.content);
        return `### Step ${s.number} — ${s.title} [${statusLabel}]${headline}\n${contentSummary}`;
      })
      .join("\n\n");

    const notStarted = steps
      .filter((s) => s.status === "not_started")
      .map((s) => `${s.number} - ${s.title}`)
      .join(", ");

    // 4. Build instructions
    const instructions = `${SYSTEM_PROMPT}

## Current Document State
The user can see all of this content in their report right now. Reference it directly when answering questions.

${documentState || "No steps have been started yet."}

${notStarted ? `\nNot started: ${notStarted}` : ""}

## Conversation History
${recentHistory}

## Current User Message
${args.message}`;

    // 5. Get Convex site URL and Subconscious API key
    const convexSiteUrl = process.env.CONVEX_SITE_URL;
    const subconsciousApiKey = process.env.SUBCONSCIOUS_API_KEY;
    const toolSecret = process.env.TOOL_ENDPOINT_SECRET;

    if (!convexSiteUrl) {
      await ctx.runMutation(internal.chat.addMessage, {
        reportId: args.reportId,
        role: "assistant",
        content:
          "Configuration error: CONVEX_SITE_URL is not set. Please set it in your Convex environment variables.",
      });
      return;
    }

    if (!subconsciousApiKey) {
      await ctx.runMutation(internal.chat.addMessage, {
        reportId: args.reportId,
        role: "assistant",
        content:
          "Configuration error: SUBCONSCIOUS_API_KEY is not set. Please set it in your Convex environment variables.",
      });
      return;
    }

    if (!toolSecret) {
      await ctx.runMutation(internal.chat.addMessage, {
        reportId: args.reportId,
        role: "assistant",
        content:
          "Configuration error: TOOL_ENDPOINT_SECRET is not set. Please set it in your Convex environment variables.",
      });
      return;
    }

    // 6. Build tools
    const tools = buildTools(convexSiteUrl, args.reportId, toolSecret);

    const apiBase = process.env.SUBCONSCIOUS_API_URL ?? "https://api.subconscious.dev/v1";

    // 7. Call Subconscious API directly
    try {
      // Create run
      const createRes = await fetch(`${apiBase}/runs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${subconsciousApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          engine: SUBCONSCIOUS_ENGINE,
          input: { instructions, tools },
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(
          `Subconscious API error (${createRes.status}): ${errText}`,
        );
      }

      const createData = await createRes.json();
      const runId = createData.runId;

      // Poll for completion
      let run = createData;
      const maxAttempts = 60;
      for (let i = 0; i < maxAttempts; i++) {
        if (
          run.status === "succeeded" ||
          run.status === "failed" ||
          run.status === "timed_out"
        ) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const pollRes = await fetch(
          `${apiBase}/runs/${runId}`,
          {
            headers: { Authorization: `Bearer ${subconsciousApiKey}` },
          },
        );
        run = await pollRes.json();
      }

      // 7. Extract answer
      let answer: string;
      if (run.result?.answer) {
        answer =
          typeof run.result.answer === "string"
            ? run.result.answer
            : JSON.stringify(run.result.answer);
      } else if (run.status === "failed") {
        throw new Error(
          `Subconscious run failed: ${run.error?.message || "unknown"}`,
        );
      } else {
        answer =
          "I processed your request. The changes should be visible in the document.";
      }

      // 8. Save assistant response
      await ctx.runMutation(internal.chat.addMessage, {
        reportId: args.reportId,
        role: "assistant",
        content: answer,
      });

      return answer;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message || error.name || "Unknown error"
          : String(error) || "Unknown error";
      console.error("[sendChatMessage] Error:", errorMessage);

      await ctx.runMutation(internal.chat.addMessage, {
        reportId: args.reportId,
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
      });

      return null;
    }
  },
});
