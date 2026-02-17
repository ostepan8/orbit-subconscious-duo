import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Verify tool endpoint secret from query parameter
function verifyToolSecret(request: Request): boolean {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  return !!secret && secret === process.env.TOOL_ENDPOINT_SECRET;
}

const UNAUTHORIZED = new Response(
  JSON.stringify({ error: "Unauthorized" }),
  { status: 401, headers: { "Content-Type": "application/json" } },
);

// Helper to parse JSON body from Subconscious tool calls
// Subconscious sends: { tool_name, parameters: { ...args }, request_id }
async function parseBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    // Extract the nested parameters object if present (Subconscious format)
    if (raw.parameters && typeof raw.parameters === "object") {
      return raw.parameters as Record<string, unknown>;
    }
    return raw;
  } catch {
    return {};
  }
}

// ── list_steps ──
// Returns a lightweight index of all 24 steps

export const listSteps = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;

  if (!reportId) {
    return new Response(JSON.stringify({ error: "reportId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const steps = await ctx.runQuery(api.deSteps.getSteps, { reportId });

  const index = steps.map((s) => ({
    stepId: s.stepId,
    number: s.number,
    title: s.title,
    status: s.status,
  }));

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// ── read_step ──
// Returns full content of a specific step

export const readStep = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;
  const stepId = body.stepId as string | undefined;

  if (!reportId || !stepId) {
    return new Response(
      JSON.stringify({ error: "reportId and stepId are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const step = await ctx.runQuery(api.deSteps.getStep, { reportId, stepId });

  if (!step) {
    return new Response(JSON.stringify({ error: `Step ${stepId} not found` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      stepId: step.stepId,
      number: step.number,
      title: step.title,
      status: step.status,
      content: step.content,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

// ── update_step ──
// Updates a step's content and/or status — triggers real-time push

export const updateStep = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;
  const stepId = body.stepId as string | undefined;
  const status = body.status as string | undefined;

  // Content can be a JSON string (from simplified tool schema) or an object
  let content: Record<string, unknown> | undefined;
  if (typeof body.content === "string") {
    try {
      content = JSON.parse(body.content) as Record<string, unknown>;
    } catch {
      return new Response(
        JSON.stringify({ error: "content must be valid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  } else {
    content = body.content as Record<string, unknown> | undefined;
  }

  if (!reportId || !stepId || !content) {
    return new Response(
      JSON.stringify({
        error: "reportId, stepId, and content are required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const result = await ctx.runMutation(api.deSteps.updateStep, {
      reportId,
      stepId,
      content,
      ...(status ? { status } : {}),
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ── read_report ──
// Returns report metadata, citations, and recommendations

export const readReport = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;

  if (!reportId) {
    return new Response(JSON.stringify({ error: "reportId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const report = await ctx.runQuery(api.reports.getReportById, { reportId });
  if (!report) {
    return new Response(JSON.stringify({ error: "Report not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const citations = await ctx.runQuery(api.reports.getCitations, { reportId });
  const recommendations = await ctx.runQuery(api.reports.getRecommendations, {
    reportId,
  });

  return new Response(
    JSON.stringify({
      title: report.title,
      summary: report.summary,
      citations: citations.map((c) => ({
        id: c.externalId,
        text: c.text,
        source: c.source,
      })),
      recommendations: recommendations.map((r) => ({
        id: r.externalId,
        title: r.title,
        description: r.description,
        priority: r.priority,
      })),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

// ── update_report ──
// Updates a report field (title or summary)

export const updateReport = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;
  const field = body.field as string | undefined;
  const value = body.value as string | undefined;

  if (!reportId || !field || !value) {
    return new Response(
      JSON.stringify({ error: "reportId, field, and value are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    await ctx.runMutation(api.reports.updateReportField, {
      reportId,
      field,
      value,
    });

    return new Response(
      JSON.stringify({ success: true, field }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ── add_citation ──
// AI adds a citation/reference during import or chat

export const addCitation = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;
  const text = body.text as string | undefined;
  const source = body.source as string | undefined;
  const url = body.url as string | undefined;
  const relevanceScore = body.relevanceScore as number | undefined;
  const stepId = body.stepId as string | undefined;

  if (!reportId || !text || !source) {
    return new Response(
      JSON.stringify({ error: "reportId, text, and source are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const result = await ctx.runMutation(api.reports.addCitation, {
      reportId,
      text,
      source,
      ...(url ? { url } : {}),
      ...(relevanceScore !== undefined ? { relevanceScore } : {}),
      ...(stepId ? { stepId } : {}),
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Add citation failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ── add_recommendation ──
// AI adds a recommendation for the user to accept or reject

export const addRecommendation = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;
  const title = body.title as string | undefined;
  const description = body.description as string | undefined;
  const priority = body.priority as string | undefined;
  const category = body.category as string | undefined;

  if (!reportId || !title || !description) {
    return new Response(
      JSON.stringify({ error: "reportId, title, and description are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const result = await ctx.runMutation(api.reports.addRecommendation, {
      reportId,
      title,
      description,
      ...(priority ? { priority } : {}),
      ...(category ? { category } : {}),
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Add recommendation failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ── propose_headlines ──
// AI proposes 2-3 headline options for a step; user selects one

export const proposeHeadlines = httpAction(async (ctx, request) => {
  if (!verifyToolSecret(request)) return UNAUTHORIZED;
  const body = await parseBody(request);
  const reportId = body.reportId as Id<"reports"> | undefined;
  const stepId = body.stepId as string | undefined;

  // Options can be a JSON string (from simplified tool schema) or an array
  let options: string[] | undefined;
  if (typeof body.options === "string") {
    try {
      options = JSON.parse(body.options) as string[];
    } catch {
      return new Response(
        JSON.stringify({ error: "options must be a valid JSON array" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  } else if (Array.isArray(body.options)) {
    options = body.options as string[];
  }

  if (!reportId || !stepId || !options || options.length === 0) {
    return new Response(
      JSON.stringify({ error: "reportId, stepId, and options are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    await ctx.runMutation(api.deSteps.proposeHeadlines, {
      reportId,
      stepId,
      options,
    });

    return new Response(JSON.stringify({ success: true, stepId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Propose failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
