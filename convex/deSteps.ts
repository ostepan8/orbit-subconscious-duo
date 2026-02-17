import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getSteps = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return [];
    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) return [];

    const steps = await ctx.db
      .query("deSteps")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
    return steps.sort((a, b) => a.number - b.number);
  },
});

export const getStep = query({
  args: { reportId: v.id("reports"), stepId: v.string() },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;
    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) return null;

    return await ctx.db
      .query("deSteps")
      .withIndex("by_stepId_report", (q) =>
        q.eq("reportId", args.reportId).eq("stepId", args.stepId),
      )
      .first();
  },
});

export const updateStep = mutation({
  args: {
    reportId: v.id("reports"),
    stepId: v.string(),
    content: v.any(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db
      .query("deSteps")
      .withIndex("by_stepId_report", (q) =>
        q.eq("reportId", args.reportId).eq("stepId", args.stepId),
      )
      .first();

    if (!step) throw new Error(`Step ${args.stepId} not found`);

    await ctx.db.patch(step._id, {
      content: args.content,
      ...(args.status ? { status: args.status } : {}),
      updatedAt: Date.now(),
    });

    return { success: true, stepId: args.stepId };
  },
});

export const selectHeadline = mutation({
  args: {
    reportId: v.id("reports"),
    stepId: v.string(),
    headline: v.string(),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db
      .query("deSteps")
      .withIndex("by_stepId_report", (q) =>
        q.eq("reportId", args.reportId).eq("stepId", args.stepId),
      )
      .first();

    if (!step) throw new Error(`Step ${args.stepId} not found`);

    await ctx.db.patch(step._id, {
      headline: args.headline,
      headlineOptions: undefined,
      status: "complete",
    });

    return { success: true, stepId: args.stepId };
  },
});

export const clearHeadline = mutation({
  args: {
    reportId: v.id("reports"),
    stepId: v.string(),
    previousOptions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db
      .query("deSteps")
      .withIndex("by_stepId_report", (q) =>
        q.eq("reportId", args.reportId).eq("stepId", args.stepId),
      )
      .first();

    if (!step) throw new Error(`Step ${args.stepId} not found`);

    await ctx.db.patch(step._id, {
      headline: undefined,
      headlineOptions: args.previousOptions,
      status: step.content ? "in_progress" : "not_started",
    });

    return { success: true, stepId: args.stepId };
  },
});

export const proposeHeadlines = mutation({
  args: {
    reportId: v.id("reports"),
    stepId: v.string(),
    options: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db
      .query("deSteps")
      .withIndex("by_stepId_report", (q) =>
        q.eq("reportId", args.reportId).eq("stepId", args.stepId),
      )
      .first();

    if (!step) throw new Error(`Step ${args.stepId} not found`);

    // Single option → auto-select it (no cards shown)
    if (args.options.length === 1) {
      await ctx.db.patch(step._id, {
        headline: args.options[0],
        headlineOptions: undefined,
        status: "complete",
      });
      return { success: true, stepId: args.stepId, autoSelected: true };
    }

    // Multiple options → show selectable cards
    await ctx.db.patch(step._id, {
      headlineOptions: args.options,
    });

    return { success: true, stepId: args.stepId };
  },
});
