import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

const CART_TTL_MS = 30 * 60 * 1000;
const BOOKING_TTL_MS = 60 * 60 * 1000;
const FINANCING_TTL_MS = 60 * 60 * 1000;

type CartItem = {
  itemId: string;
  quantity: number;
  unitPrice: number;
};

const appStatus = v.union(v.literal("active"), v.literal("disabled"));

const cartItem = v.object({
  itemId: v.string(),
  quantity: v.number(),
  unitPrice: v.number()
});

const catalogCollection = v.union(
  v.literal("carDealers"),
  v.literal("carListings"),
  v.literal("ecommerceCategories"),
  v.literal("ecommerceProducts"),
  v.literal("realEstateProperties"),
  v.literal("stayListings")
);

type CatalogCollection =
  | "carDealers"
  | "carListings"
  | "ecommerceCategories"
  | "ecommerceProducts"
  | "realEstateProperties"
  | "stayListings";

type CatalogPayload = Record<string, unknown>;

export const validateApiKey = mutation({
  args: {
    keyHash: v.string(),
    prefix: v.string()
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.keyHash))
      .unique();

    if (!record || record.status !== "active") {
      return null;
    }

    return {
      apiKeyId: record._id,
      apiKeyPrefix: args.prefix,
      name: record.name
    };
  }
});

export const recordUsage = mutation({
  args: {
    apiKeyId: v.string(),
    verticalSlug: v.string(),
    endpoint: v.string(),
    method: v.string(),
    statusCode: v.number(),
    durationMs: v.number(),
    occurredAt: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageEvents", {
      ...args,
      day: new Date(args.occurredAt).toISOString().slice(0, 10)
    });
  }
});

export const createCart = mutation({
  args: {
    verticalSlug: v.string(),
    apiKeyId: v.string()
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const id = await ctx.db.insert("carts", {
      verticalSlug: args.verticalSlug,
      apiKeyId: args.apiKeyId,
      items: [],
      expiresAt: timestamp + CART_TTL_MS,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    const cart = await ctx.db.get(id);
    return cart ? serializeDoc(cart) : null;
  }
});

export const getCart = mutation({
  args: {
    cartId: v.string(),
    verticalSlug: v.string(),
    apiKeyId: v.string()
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId as Id<"carts">);
    if (!cart || cart.verticalSlug !== args.verticalSlug || cart.apiKeyId !== args.apiKeyId) {
      return null;
    }

    if (cart.expiresAt <= Date.now()) {
      await ctx.db.delete(cart._id);
      return null;
    }

    return serializeDoc(cart);
  }
});

export const addCartItem = mutation({
  args: {
    cartId: v.string(),
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    itemId: v.string(),
    quantity: v.number(),
    unitPrice: v.number()
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId as Id<"carts">);
    if (!cart || cart.verticalSlug !== args.verticalSlug || cart.apiKeyId !== args.apiKeyId) {
      throw new Error("Cart was not found.");
    }

    if (cart.expiresAt <= Date.now()) {
      await ctx.db.delete(cart._id);
      throw new Error("Cart was not found.");
    }

    const items = [...cart.items];
    const existing = items.find((item) => item.itemId === args.itemId);
    if (existing) {
      existing.quantity += args.quantity;
    } else {
      items.push({
        itemId: args.itemId,
        quantity: args.quantity,
        unitPrice: args.unitPrice
      });
    }

    await ctx.db.patch(cart._id, {
      items,
      updatedAt: Date.now()
    });

    const updated = await ctx.db.get(cart._id);
    return updated ? serializeDoc(updated) : null;
  }
});

export const checkoutCart = mutation({
  args: {
    cartId: v.string(),
    verticalSlug: v.string(),
    apiKeyId: v.string()
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId as Id<"carts">);
    if (!cart || cart.verticalSlug !== args.verticalSlug || cart.apiKeyId !== args.apiKeyId) {
      throw new Error("Cart was not found.");
    }

    if (cart.items.length === 0) {
      throw new Error("Cart must contain at least one item before checkout.");
    }

    const total = cart.items.reduce((sum: number, item: CartItem) => sum + item.unitPrice * item.quantity, 0);
    const createdAt = Date.now();
    const checkoutId = await ctx.db.insert("checkouts", {
      verticalSlug: args.verticalSlug,
      apiKeyId: args.apiKeyId,
      cartId: cart._id,
      total,
      status: "confirmed",
      createdAt
    });

    await ctx.db.delete(cart._id);
    const checkout = await ctx.db.get(checkoutId);
    return checkout ? serializeDoc(checkout) : null;
  }
});

export const getCheckout = mutation({
  args: {
    checkoutId: v.string(),
    verticalSlug: v.string(),
    apiKeyId: v.string()
  },
  handler: async (ctx, args) => {
    const checkout = await ctx.db.get(args.checkoutId as Id<"checkouts">);
    if (!checkout || checkout.verticalSlug !== args.verticalSlug || checkout.apiKeyId !== args.apiKeyId) {
      return null;
    }

    return serializeDoc(checkout);
  }
});

export const createBooking = mutation({
  args: {
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    itemId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    guestName: v.optional(v.string()),
    total: v.number()
  },
  handler: async (ctx, args) => {
    if (Date.parse(args.startDate) >= Date.parse(args.endDate)) {
      throw new Error("endDate must be after startDate.");
    }

    const createdAt = Date.now();
    const id = await ctx.db.insert("bookings", {
      verticalSlug: args.verticalSlug,
      apiKeyId: args.apiKeyId,
      itemId: args.itemId,
      startDate: args.startDate,
      endDate: args.endDate,
      ...(args.guestName ? { guestName: args.guestName } : {}),
      total: args.total,
      status: "confirmed",
      expiresAt: createdAt + BOOKING_TTL_MS,
      createdAt
    });

    const booking = await ctx.db.get(id);
    return booking ? serializeDoc(booking) : null;
  }
});

export const createFinancingPrequalification = mutation({
  args: {
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
    status: v.union(v.literal("qualified"), v.literal("review_required"))
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const id = await ctx.db.insert("financingPrequalifications", {
      ...args,
      expiresAt: createdAt + FINANCING_TTL_MS,
      createdAt
    });

    const prequalification = await ctx.db.get(id);
    return prequalification ? serializeDoc(prequalification) : null;
  }
});

export const getFinancingPrequalification = mutation({
  args: {
    id: v.string(),
    verticalSlug: v.string(),
    apiKeyId: v.string()
  },
  handler: async (ctx, args) => {
    const prequalification = await ctx.db.get(args.id as Id<"financingPrequalifications">);
    if (
      !prequalification ||
      prequalification.verticalSlug !== args.verticalSlug ||
      prequalification.apiKeyId !== args.apiKeyId
    ) {
      return null;
    }

    if (prequalification.expiresAt <= Date.now()) {
      await ctx.db.delete(prequalification._id);
      return null;
    }

    return serializeDoc(prequalification);
  }
});

export const createOrder = mutation({
  args: {
    verticalSlug: v.string(),
    apiKeyId: v.string(),
    checkoutId: v.string(),
    items: v.array(cartItem),
    subtotal: v.number(),
    total: v.number(),
    customerEmail: v.optional(v.string()),
    shippingPostalCode: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const checkout = await ctx.db.get(args.checkoutId as Id<"checkouts">);
    if (!checkout || checkout.verticalSlug !== args.verticalSlug || checkout.apiKeyId !== args.apiKeyId) {
      throw new Error("Checkout was not found.");
    }

    const createdAt = Date.now();
    const id = await ctx.db.insert("orders", {
      ...args,
      status: "confirmed",
      createdAt
    });

    const order = await ctx.db.get(id);
    return order ? serializeDoc(order) : null;
  }
});

export const getOrder = mutation({
  args: {
    orderId: v.string(),
    verticalSlug: v.string(),
    apiKeyId: v.string()
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId as Id<"orders">);
    if (!order || order.verticalSlug !== args.verticalSlug || order.apiKeyId !== args.apiKeyId) {
      return null;
    }

    return serializeDoc(order);
  }
});

export const createApiKey = mutation({
  args: {
    name: v.string(),
    prefix: v.string(),
    keyHash: v.string()
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const id = await ctx.db.insert("apiKeys", {
      name: args.name,
      prefix: args.prefix,
      keyHash: args.keyHash,
      status: "active",
      createdAt
    });

    const record = await ctx.db.get(id);
    return record ? serializeApiKey(record) : null;
  }
});

export const revokeApiKey = mutation({
  args: {
    id: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id as Id<"apiKeys">, {
      status: "revoked",
      revokedAt: Date.now()
    });

    const record = await ctx.db.get(args.id as Id<"apiKeys">);
    return record ? serializeApiKey(record) : null;
  }
});

export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = Date.now();
    const expiredCarts = await ctx.db
      .query("carts")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", timestamp))
      .collect();
    const expiredBookings = await ctx.db
      .query("bookings")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", timestamp))
      .collect();
    const expiredPrequalifications = await ctx.db
      .query("financingPrequalifications")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", timestamp))
      .collect();

    await Promise.all([
      ...expiredCarts.map((cart) => ctx.db.delete(cart._id)),
      ...expiredBookings.map((booking) => ctx.db.delete(booking._id)),
      ...expiredPrequalifications.map((prequalification) => ctx.db.delete(prequalification._id))
    ]);

    return {
      carts: expiredCarts.length,
      bookings: expiredBookings.length,
      financingPrequalifications: expiredPrequalifications.length
    };
  }
});

export const syncRegistry = mutation({
  args: {
    apps: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        description: v.string(),
        journey: v.array(v.string()),
        media: v.array(v.string())
      })
    ),
    endpoints: v.array(
      v.object({
        contractId: v.string(),
        appSlug: v.string(),
        method: v.string(),
        path: v.string()
      })
    ),
    mediaAssets: v.optional(
      v.array(
        v.object({
          assetKey: v.string(),
          fileName: v.string(),
          contentType: v.string()
        })
      )
    ),
    catalog: v.optional(
      v.object({
        carDealers: v.array(v.any()),
        carListings: v.array(v.any()),
        ecommerceCategories: v.array(v.any()),
        ecommerceProducts: v.array(v.any()),
        realEstateProperties: v.array(v.any()),
        stayListings: v.array(v.any())
      })
    )
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    for (const app of args.apps) {
      const existing = await ctx.db
        .query("apiApps")
        .withIndex("by_slug", (q) => q.eq("slug", app.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: app.name,
          description: app.description,
          journey: app.journey,
          media: app.media,
          updatedAt: timestamp
        });
      } else {
        await ctx.db.insert("apiApps", {
          ...app,
          status: "active",
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }

    for (const endpoint of args.endpoints) {
      const existing = await ctx.db
        .query("apiEndpoints")
        .withIndex("by_signature", (q) => q.eq("method", endpoint.method).eq("path", endpoint.path))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          appSlug: endpoint.appSlug,
          contractId: endpoint.contractId,
          updatedAt: timestamp
        });
      } else {
        await ctx.db.insert("apiEndpoints", {
          ...endpoint,
          status: "active",
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    }

    const missingMediaKeys = await syncMediaAssetMetadata(ctx, args.mediaAssets ?? [], timestamp);
    const catalogCounts = args.catalog ? await syncCatalogRecords(ctx, args.catalog, timestamp) : {};

    return {
      apps: args.apps.length,
      endpoints: args.endpoints.length,
      catalog: catalogCounts,
      missingMediaKeys
    };
  }
});

export const attachMediaStorage = mutation({
  args: {
    assetKey: v.string(),
    storageId: v.id("_storage"),
    byteLength: v.number()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mediaAssets")
      .withIndex("by_asset_key", (q) => q.eq("assetKey", args.assetKey))
      .unique();

    if (!existing) {
      throw new Error("Media asset was not found.");
    }

    if (existing.storageId) {
      return serializeDoc(existing);
    }

    await ctx.db.patch(existing._id, {
      storageId: args.storageId,
      byteLength: args.byteLength,
      updatedAt: Date.now()
    });

    const updated = await ctx.db.get(existing._id);
    return updated ? serializeDoc(updated) : null;
  }
});

export const listCatalogRecords = query({
  args: {
    collection: catalogCollection
  },
  handler: async (ctx, args) => {
    const docs = await catalogDocs(ctx, args.collection);
    return Promise.all(docs.map((doc) => hydrateCatalogPayload(ctx, doc.payload as CatalogPayload)));
  }
});

export const getCatalogRecord = query({
  args: {
    collection: catalogCollection,
    externalId: v.string()
  },
  handler: async (ctx, args) => {
    const doc = await catalogDocByExternalId(ctx, args.collection, args.externalId);
    return doc ? hydrateCatalogPayload(ctx, doc.payload as CatalogPayload) : null;
  }
});

export const resolveEndpoint = query({
  args: {
    method: v.string(),
    path: v.string()
  },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db
      .query("apiEndpoints")
      .withIndex("by_signature", (q) => q.eq("method", args.method).eq("path", args.path))
      .unique();

    if (!endpoint || endpoint.status !== "active") {
      return { live: false };
    }

    const app = await ctx.db
      .query("apiApps")
      .withIndex("by_slug", (q) => q.eq("slug", endpoint.appSlug))
      .unique();

    return {
      live: Boolean(app && app.status === "active"),
      appStatus: app?.status,
      endpointStatus: endpoint.status
    };
  }
});

export const setAppStatus = mutation({
  args: {
    slug: v.string(),
    status: appStatus
  },
  handler: async (ctx, args) => {
    const app = await ctx.db
      .query("apiApps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!app) {
      throw new Error("App was not found.");
    }

    await ctx.db.patch(app._id, {
      status: args.status,
      updatedAt: Date.now()
    });

    const updated = await ctx.db.get(app._id);
    return updated ? serializeDoc(updated) : null;
  }
});

export const setEndpointStatus = mutation({
  args: {
    method: v.string(),
    path: v.string(),
    status: appStatus
  },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db
      .query("apiEndpoints")
      .withIndex("by_signature", (q) => q.eq("method", args.method).eq("path", args.path))
      .unique();

    if (!endpoint) {
      throw new Error("Endpoint was not found.");
    }

    await ctx.db.patch(endpoint._id, {
      status: args.status,
      updatedAt: Date.now()
    });

    const updated = await ctx.db.get(endpoint._id);
    return updated ? serializeDoc(updated) : null;
  }
});

export const createResponse = mutation({
  args: {
    appSlug: v.string(),
    method: v.string(),
    path: v.string(),
    name: v.string(),
    statusCode: v.number(),
    body: v.string()
  },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db
      .query("apiEndpoints")
      .withIndex("by_signature", (q) => q.eq("method", args.method).eq("path", args.path))
      .unique();

    if (!endpoint || endpoint.appSlug !== args.appSlug) {
      throw new Error("Endpoint was not found.");
    }

    JSON.parse(args.body);

    const timestamp = Date.now();
    const id = await ctx.db.insert("apiResponses", {
      appSlug: args.appSlug,
      method: args.method,
      path: args.path,
      name: args.name,
      statusCode: args.statusCode,
      body: args.body,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp
    });

    const response = await ctx.db.get(id);
    return response ? serializeDoc(response) : null;
  }
});

export const deleteResponse = mutation({
  args: {
    id: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id as Id<"apiResponses">);
    return { id: args.id };
  }
});

export const adminSummary = query({
  args: {},
  handler: async (ctx) => {
    const [
      apiKeys,
      usageEvents,
      carts,
      bookings,
      checkouts,
      prequalifications,
      orders,
      apps,
      endpoints,
      responses
    ] = await Promise.all([
      ctx.db.query("apiKeys").collect(),
      ctx.db.query("usageEvents").collect(),
      ctx.db.query("carts").collect(),
      ctx.db.query("bookings").collect(),
      ctx.db.query("checkouts").collect(),
      ctx.db.query("financingPrequalifications").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("apiApps").collect(),
      ctx.db.query("apiEndpoints").collect(),
      ctx.db.query("apiResponses").collect()
    ]);

    const usageByVertical = new Map<string, { requests: number; errors: number; durations: number[] }>();
    for (const event of usageEvents) {
      const current = usageByVertical.get(event.verticalSlug) ?? { requests: 0, errors: 0, durations: [] };
      current.requests += 1;
      if (event.statusCode >= 400) {
        current.errors += 1;
      }
      current.durations.push(event.durationMs);
      usageByVertical.set(event.verticalSlug, current);
    }

    return {
      apiKeys: apiKeys.map(serializeApiKey),
      usage: Array.from(usageByVertical.entries()).map(([verticalSlug, value]) => ({
        verticalSlug,
        requests: value.requests,
        errors: value.errors,
        p95Ms: percentile(value.durations, 95)
      })),
      state: {
        activeCarts: carts.filter((cart) => cart.expiresAt > Date.now()).length,
        activeBookings: bookings.filter((booking) => booking.expiresAt > Date.now()).length,
        activePrequalifications: prequalifications.filter((prequalification) => prequalification.expiresAt > Date.now())
          .length,
        checkouts: checkouts.length,
        orders: orders.length
      },
      registry: {
        apps: apps.map(serializeDoc),
        endpoints: endpoints.map(serializeDoc),
        responses: responses.map(serializeDoc)
      }
    };
  }
});

async function syncMediaAssetMetadata(
  ctx: MutationCtx,
  mediaAssets: Array<{ assetKey: string; fileName: string; contentType: string }>,
  timestamp: number
): Promise<string[]> {
  const missingMediaKeys: string[] = [];

  for (const asset of mediaAssets) {
    const existing = await ctx.db
      .query("mediaAssets")
      .withIndex("by_asset_key", (q) => q.eq("assetKey", asset.assetKey))
      .unique();
    const patch = {
      verticalSlug: verticalSlugForAsset(asset.assetKey),
      fileName: asset.fileName,
      contentType: asset.contentType,
      updatedAt: timestamp
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      if (!existing.storageId) {
        missingMediaKeys.push(asset.assetKey);
      }
      continue;
    }

    await ctx.db.insert("mediaAssets", {
      assetKey: asset.assetKey,
      ...patch,
      createdAt: timestamp
    });
    missingMediaKeys.push(asset.assetKey);
  }

  return missingMediaKeys;
}

async function syncCatalogRecords(
  ctx: MutationCtx,
  catalog: {
    carDealers: unknown[];
    carListings: unknown[];
    ecommerceCategories: unknown[];
    ecommerceProducts: unknown[];
    realEstateProperties: unknown[];
    stayListings: unknown[];
  },
  timestamp: number
) {
  await Promise.all([
    ...catalog.carDealers.map((payload) => upsertCarDealer(ctx, payload, timestamp)),
    ...catalog.carListings.map((payload) => upsertCarListing(ctx, payload, timestamp)),
    ...catalog.ecommerceCategories.map((payload) => upsertEcommerceCategory(ctx, payload, timestamp)),
    ...catalog.ecommerceProducts.map((payload) => upsertEcommerceProduct(ctx, payload, timestamp)),
    ...catalog.realEstateProperties.map((payload) => upsertRealEstateProperty(ctx, payload, timestamp)),
    ...catalog.stayListings.map((payload) => upsertStayListing(ctx, payload, timestamp))
  ]);

  return {
    carDealers: catalog.carDealers.length,
    carListings: catalog.carListings.length,
    ecommerceCategories: catalog.ecommerceCategories.length,
    ecommerceProducts: catalog.ecommerceProducts.length,
    realEstateProperties: catalog.realEstateProperties.length,
    stayListings: catalog.stayListings.length
  };
}

async function upsertCarDealer(ctx: MutationCtx, payload: unknown, timestamp: number): Promise<void> {
  const record = asCatalogPayload(payload);
  const externalId = requiredString(record.id, "car dealer id");
  const document = {
    externalId,
    city: requiredString(record.city, "car dealer city"),
    state: requiredString(record.state, "car dealer state"),
    payload: record,
    updatedAt: timestamp
  };
  const existing = await ctx.db
    .query("carDealers")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, document);
    return;
  }

  await ctx.db.insert("carDealers", { ...document, createdAt: timestamp });
}

async function upsertCarListing(ctx: MutationCtx, payload: unknown, timestamp: number): Promise<void> {
  const record = asCatalogPayload(payload);
  const externalId = requiredString(record.id, "car listing id");
  const document = {
    externalId,
    dealerId: requiredString(record.dealerId, "car listing dealerId"),
    make: requiredString(record.make, "car listing make"),
    model: requiredString(record.model, "car listing model"),
    city: requiredString(record.city, "car listing city"),
    bodyStyle: requiredString(record.bodyStyle, "car listing bodyStyle"),
    fuelType: requiredString(record.fuelType, "car listing fuelType"),
    condition: requiredString(record.condition, "car listing condition"),
    price: requiredNumber(record.price, "car listing price"),
    mileage: requiredNumber(record.mileage, "car listing mileage"),
    payload: record,
    updatedAt: timestamp
  };
  const existing = await ctx.db
    .query("carListings")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, document);
    return;
  }

  await ctx.db.insert("carListings", { ...document, createdAt: timestamp });
}

async function upsertEcommerceCategory(ctx: MutationCtx, payload: unknown, timestamp: number): Promise<void> {
  const record = asCatalogPayload(payload);
  const externalId = requiredString(record.id, "ecommerce category id");
  const document = {
    externalId,
    slug: requiredString(record.slug, "ecommerce category slug"),
    payload: record,
    updatedAt: timestamp
  };
  const existing = await ctx.db
    .query("ecommerceCategories")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, document);
    return;
  }

  await ctx.db.insert("ecommerceCategories", { ...document, createdAt: timestamp });
}

async function upsertEcommerceProduct(ctx: MutationCtx, payload: unknown, timestamp: number): Promise<void> {
  const record = asCatalogPayload(payload);
  const externalId = requiredString(record.id, "ecommerce product id");
  const document = {
    externalId,
    categoryId: requiredString(record.categoryId, "ecommerce product categoryId"),
    price: requiredNumber(record.price, "ecommerce product price"),
    stock: requiredNumber(record.stock, "ecommerce product stock"),
    payload: record,
    updatedAt: timestamp
  };
  const existing = await ctx.db
    .query("ecommerceProducts")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, document);
    return;
  }

  await ctx.db.insert("ecommerceProducts", { ...document, createdAt: timestamp });
}

async function upsertRealEstateProperty(ctx: MutationCtx, payload: unknown, timestamp: number): Promise<void> {
  const record = asCatalogPayload(payload);
  const externalId = requiredString(record.id, "real estate property id");
  const document = {
    externalId,
    city: requiredString(record.city, "real estate property city"),
    propertyType: requiredString(record.propertyType, "real estate property propertyType"),
    price: requiredNumber(record.price, "real estate property price"),
    bedrooms: requiredNumber(record.bedrooms, "real estate property bedrooms"),
    bathrooms: requiredNumber(record.bathrooms, "real estate property bathrooms"),
    payload: record,
    updatedAt: timestamp
  };
  const existing = await ctx.db
    .query("realEstateProperties")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, document);
    return;
  }

  await ctx.db.insert("realEstateProperties", { ...document, createdAt: timestamp });
}

async function upsertStayListing(ctx: MutationCtx, payload: unknown, timestamp: number): Promise<void> {
  const record = asCatalogPayload(payload);
  const externalId = requiredString(record.id, "stay listing id");
  const document = {
    externalId,
    city: requiredString(record.city, "stay listing city"),
    maxGuests: requiredNumber(record.maxGuests, "stay listing maxGuests"),
    nightlyRate: requiredNumber(record.nightlyRate, "stay listing nightlyRate"),
    payload: record,
    updatedAt: timestamp
  };
  const existing = await ctx.db
    .query("stayListings")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, document);
    return;
  }

  await ctx.db.insert("stayListings", { ...document, createdAt: timestamp });
}

async function catalogDocs(ctx: QueryCtx, collection: CatalogCollection) {
  switch (collection) {
    case "carDealers":
      return ctx.db.query("carDealers").collect();
    case "carListings":
      return ctx.db.query("carListings").collect();
    case "ecommerceCategories":
      return ctx.db.query("ecommerceCategories").collect();
    case "ecommerceProducts":
      return ctx.db.query("ecommerceProducts").collect();
    case "realEstateProperties":
      return ctx.db.query("realEstateProperties").collect();
    case "stayListings":
      return ctx.db.query("stayListings").collect();
  }
}

async function catalogDocByExternalId(ctx: QueryCtx, collection: CatalogCollection, externalId: string) {
  switch (collection) {
    case "carDealers":
      return ctx.db.query("carDealers").withIndex("by_external_id", (q) => q.eq("externalId", externalId)).unique();
    case "carListings":
      return ctx.db.query("carListings").withIndex("by_external_id", (q) => q.eq("externalId", externalId)).unique();
    case "ecommerceCategories":
      return ctx.db
        .query("ecommerceCategories")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .unique();
    case "ecommerceProducts":
      return ctx.db
        .query("ecommerceProducts")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .unique();
    case "realEstateProperties":
      return ctx.db
        .query("realEstateProperties")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .unique();
    case "stayListings":
      return ctx.db.query("stayListings").withIndex("by_external_id", (q) => q.eq("externalId", externalId)).unique();
  }
}

async function hydrateCatalogPayload(ctx: QueryCtx, payload: CatalogPayload): Promise<CatalogPayload> {
  const result = { ...payload };

  if (typeof result.heroImage === "string") {
    result.heroImage = await mediaUrl(ctx, result.heroImage);
  }

  if (Array.isArray(result.gallery)) {
    result.gallery = await Promise.all(
      result.gallery.map((assetKey) => (typeof assetKey === "string" ? mediaUrl(ctx, assetKey) : assetKey))
    );
  }

  return result;
}

async function mediaUrl(ctx: QueryCtx, assetKey: string): Promise<string> {
  const asset = await ctx.db
    .query("mediaAssets")
    .withIndex("by_asset_key", (q) => q.eq("assetKey", assetKey))
    .unique();

  if (!asset?.storageId) {
    return assetKey;
  }

  return (await ctx.storage.getUrl(asset.storageId)) ?? assetKey;
}

function asCatalogPayload(payload: unknown): CatalogPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Catalog record payload must be an object.");
  }

  return payload as CatalogPayload;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Missing ${field}.`);
  }

  return value;
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Missing ${field}.`);
  }

  return value;
}

function verticalSlugForAsset(assetKey: string): string {
  const [, assetsSegment, verticalSlug] = assetKey.split("/");
  if (assetsSegment !== "assets" || !verticalSlug) {
    throw new Error(`Invalid media asset key: ${assetKey}`);
  }

  return verticalSlug;
}

function serializeApiKey(record: {
  _id: string;
  name: string;
  prefix: string;
  status: "active" | "revoked";
  createdAt: number;
  revokedAt?: number;
}) {
  return {
    id: record._id,
    name: record.name,
    prefix: record.prefix,
    status: record.status,
    createdAt: record.createdAt,
    revokedAt: record.revokedAt
  };
}

function serializeDoc<T extends { _id: string }>(doc: T): Omit<T, "_id" | "_creationTime"> & { id: string } {
  const { _id, _creationTime: _ignored, ...rest } = doc as T & { _creationTime?: number };
  return { id: _id, ...rest };
}

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}
