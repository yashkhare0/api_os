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
  mediaAssets: defineTable({
    verticalSlug: v.string(),
    assetKey: v.string(),
    fileName: v.string(),
    contentType: v.string(),
    byteLength: v.optional(v.number()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_asset_key", ["assetKey"])
    .index("by_vertical", ["verticalSlug"]),
  carDealers: defineTable({
    externalId: v.string(),
    city: v.string(),
    state: v.string(),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_external_id", ["externalId"]),
  carListings: defineTable({
    externalId: v.string(),
    dealerId: v.string(),
    make: v.string(),
    model: v.string(),
    city: v.string(),
    bodyStyle: v.string(),
    fuelType: v.string(),
    condition: v.string(),
    price: v.number(),
    mileage: v.number(),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_external_id", ["externalId"])
    .index("by_dealer", ["dealerId"]),
  ecommerceCategories: defineTable({
    externalId: v.string(),
    slug: v.string(),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_external_id", ["externalId"])
    .index("by_slug", ["slug"]),
  ecommerceProducts: defineTable({
    externalId: v.string(),
    categoryId: v.string(),
    price: v.number(),
    stock: v.number(),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_external_id", ["externalId"])
    .index("by_category", ["categoryId"]),
  realEstateProperties: defineTable({
    externalId: v.string(),
    city: v.string(),
    propertyType: v.string(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_external_id", ["externalId"]),
  stayListings: defineTable({
    externalId: v.string(),
    city: v.string(),
    maxGuests: v.number(),
    nightlyRate: v.number(),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_external_id", ["externalId"]),
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
