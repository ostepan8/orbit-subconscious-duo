import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getReport = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!report) return null;

    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) return null;

    return report;
  },
});

export const getReportById = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;

    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) return null;

    return report;
  },
});

export const getMyReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return reports.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getCitations = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return [];
    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) return [];

    return await ctx.db
      .query("citations")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
  },
});

export const getRecommendations = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return [];
    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) return [];

    return await ctx.db
      .query("recommendations")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
  },
});

export const addCitation = mutation({
  args: {
    reportId: v.id("reports"),
    text: v.string(),
    source: v.string(),
    url: v.optional(v.string()),
    relevanceScore: v.optional(v.number()),
    stepId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const externalId = `cit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await ctx.db.insert("citations", {
      reportId: args.reportId,
      externalId,
      text: args.text,
      source: args.source,
      url: args.url,
      relevanceScore: args.relevanceScore ?? 0.8,
      stepId: args.stepId,
    });
    return { success: true, externalId };
  },
});

export const addRecommendation = mutation({
  args: {
    reportId: v.id("reports"),
    title: v.string(),
    description: v.string(),
    priority: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const externalId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await ctx.db.insert("recommendations", {
      reportId: args.reportId,
      externalId,
      title: args.title,
      description: args.description,
      priority: args.priority ?? "medium",
      category: args.category ?? "general",
      status: "pending",
    });
    return { success: true, externalId };
  },
});

export const updateRecommendationStatus = mutation({
  args: {
    reportId: v.id("reports"),
    externalId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const rec = await ctx.db
      .query("recommendations")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .filter((q) => q.eq(q.field("externalId"), args.externalId))
      .first();
    if (!rec) throw new Error("Recommendation not found");
    await ctx.db.patch(rec._id, { status: args.status });
  },
});

export const deleteReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");
    const userId = await getAuthUserId(ctx);
    if (!userId || report.userId !== userId) throw new Error("Not authorized");

    // Delete all related data
    const citations = await ctx.db
      .query("citations")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
    for (const c of citations) await ctx.db.delete(c._id);

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
    for (const r of recommendations) await ctx.db.delete(r._id);

    const steps = await ctx.db
      .query("deSteps")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
    for (const s of steps) await ctx.db.delete(s._id);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .collect();
    for (const m of messages) await ctx.db.delete(m._id);

    await ctx.db.delete(args.reportId);
  },
});

export const updateReportField = mutation({
  args: {
    reportId: v.id("reports"),
    field: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    if (args.field === "title" || args.field === "summary") {
      await ctx.db.patch(args.reportId, { [args.field]: args.value });
    }
  },
});
