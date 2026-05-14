import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  apiKeys: defineTable({
    name: v.string(),
    prefix: v.string(),
    keyHash: v.string(),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
    revokedAt: v.optional(v.number())
  })
    .index("by_keyHash", ["keyHash"])
    .index("by_status", ["status"]),
  usageEvents: defineTable({
    apiKeyId: v.string(),
    verticalSlug: v.string(),
    endpoint: v.string(),
    method: v.string(),
    statusCode: v.number(),
    durationMs: v.number(),
    occurredAt: v.number(),
    day: v.string()
  })
    .index("by_day", ["day"])
    .index("by_vertical_day", ["verticalSlug", "day"])
    .index("by_api_key", ["apiKeyId"]),
  carts: defineTable({
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    items: v.array(
      v.object({
        itemId: v.string(),
        quantity: v.number(),
        unitPrice: v.number()
      })
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_owner", ["verticalSlug", "apiKeyId"])
    .index("by_expires_at", ["expiresAt"]),
  bookings: defineTable({
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    itemId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    guestName: v.optional(v.string()),
    total: v.number(),
    status: v.literal("confirmed"),
    expiresAt: v.number(),
    createdAt: v.number()
  })
    .index("by_owner", ["verticalSlug", "apiKeyId"])
    .index("by_expires_at", ["expiresAt"]),
  checkouts: defineTable({
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    cartId: v.optional(v.string()),
    bookingId: v.optional(v.string()),
    total: v.number(),
    status: v.literal("confirmed"),
    createdAt: v.number()
  }).index("by_owner", ["verticalSlug", "apiKeyId"]),
  financingPrequalifications: defineTable({
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    listingId: v.string(),
    applicantName: v.optional(v.string()),
    annualIncome: v.number(),
    downPayment: v.number(),
    creditRating: v.union(v.literal("excellent"), v.literal("good"), v.literal("fair"), v.literal("building")),
    termMonths: v.number(),
    apr: v.number(),
    amountFinanced: v.number(),
    estimatedMonthlyPayment: v.number(),
    status: v.union(v.literal("qualified"), v.literal("review_required")),
    expiresAt: v.number(),
    createdAt: v.number()
  })
    .index("by_owner", ["verticalSlug", "apiKeyId"])
    .index("by_expires_at", ["expiresAt"]),
  orders: defineTable({
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    checkoutId: v.string(),
    items: v.array(
      v.object({
        itemId: v.string(),
        quantity: v.number(),
        unitPrice: v.number()
      })
    ),
    subtotal: v.number(),
    total: v.number(),
    customerEmail: v.optional(v.string()),
    shippingPostalCode: v.optional(v.string()),
    status: v.literal("confirmed"),
    createdAt: v.number()
  }).index("by_owner", ["verticalSlug", "apiKeyId"]),
  apiApps: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    journey: v.array(v.string()),
    media: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("disabled")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  apiEndpoints: defineTable({
    appSlug: v.string(),
    contractId: v.string(),
    method: v.string(),
    path: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_app", ["appSlug"])
    .index("by_signature", ["method", "path"]),
  apiResponses: defineTable({
    appSlug: v.string(),
    method: v.string(),
    path: v.string(),
    name: v.string(),
    statusCode: v.number(),
    body: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_endpoint", ["appSlug", "method", "path"])
});
