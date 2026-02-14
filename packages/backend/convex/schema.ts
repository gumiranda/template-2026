import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
    role: v.optional(v.string()),
    sector: v.optional(v.string()),
    status: v.optional(v.string()),
    plan: v.optional(v.string()),
    planExpiresAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.id("users")),
    rejectedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_status", ["status"])
    .index("by_plan", ["plan"]),

  subscriptionPlans: defineTable({
    name: v.string(),
    slug: v.string(),
    price: v.number(),
    interval: v.string(),
    features: v.array(v.string()),
    maxTeamMembers: v.number(),
    maxProjects: v.number(),
    maxApiRequests: v.number(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),

  subscriptionEvents: defineTable({
    userId: v.id("users"),
    eventType: v.string(),
    planSlug: v.string(),
    metadata: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
