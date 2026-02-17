import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  reports: defineTable({
    externalId: v.string(),
    title: v.string(),
    summary: v.string(),
    createdAt: v.number(),
    userId: v.id("users"),
  })
    .index("by_externalId", ["externalId"])
    .index("by_userId", ["userId"]),

  citations: defineTable({
    reportId: v.id("reports"),
    externalId: v.string(),
    text: v.string(),
    source: v.string(),
    pageNumber: v.optional(v.number()),
    url: v.optional(v.string()),
    relevanceScore: v.number(),
    stepId: v.optional(v.string()),
  }).index("by_report", ["reportId"]),

  recommendations: defineTable({
    reportId: v.id("reports"),
    externalId: v.string(),
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    category: v.string(),
    status: v.optional(v.string()), // "pending" | "accepted" | "rejected"
  }).index("by_report", ["reportId"]),

  deSteps: defineTable({
    reportId: v.id("reports"),
    stepId: v.string(),
    number: v.number(),
    title: v.string(),
    status: v.string(),
    content: v.any(),
    updatedAt: v.number(),
    headline: v.optional(v.string()),
    headlineOptions: v.optional(v.array(v.string())),
  })
    .index("by_report", ["reportId"])
    .index("by_stepId_report", ["reportId", "stepId"]),

  chatMessages: defineTable({
    reportId: v.id("reports"),
    role: v.string(),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_report", ["reportId"]),
});
