import { httpAction } from "./_generated/server";
import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/auth/validate-key",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.state.validateApiKey, body);
    return json({ data: result });
  })
});

http.route({
  path: "/usage/record",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    await ctx.runMutation(api.state.recordUsage, body);
    return json({ data: null });
  })
});

http.route({
  path: "/registry/resolve",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runQuery(api.state.resolveEndpoint, {
      method: String(body.method),
      path: String(body.path)
    });
    return json({ data });
  })
});

http.route({
  path: "/journeys/carts",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.createCart, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/carts/get",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.getCart, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/carts/items",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.addCartItem, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/checkouts",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.checkoutCart, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/checkouts/get",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.getCheckout, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/bookings",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.createBooking, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/financing-prequalifications",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.createFinancingPrequalification, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/financing-prequalifications/get",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.getFinancingPrequalification, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/orders",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.createOrder, body);
    return json({ data });
  })
});

http.route({
  path: "/journeys/orders/get",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.getOrder, body);
    return json({ data });
  })
});

http.route({
  path: "/catalog/list",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runQuery(api.state.listCatalogRecords, {
      collection: body.collection
    });
    return json({ data });
  })
});

http.route({
  path: "/catalog/get",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runQuery(api.state.getCatalogRecord, {
      collection: body.collection,
      externalId: String(body.externalId)
    });
    return json({ data });
  })
});

http.route({
  path: "/admin/summary",
  method: "GET",
  handler: internalHttpAction(async (ctx, _request) => {
    const data = await ctx.runQuery(api.state.adminSummary);
    return json({ data });
  })
});

http.route({
  path: "/admin/media/upload",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const assetKey = String(body.assetKey);
    const contentType = String(body.contentType ?? "application/octet-stream");
    const bytes = decodeBase64(String(body.contentBase64 ?? ""));
    const storageId = await ctx.storage.store(new Blob([bytes], { type: contentType }));
    const data = await ctx.runMutation(api.state.attachMediaStorage, {
      assetKey,
      storageId: storageId as Id<"_storage">,
      byteLength: bytes.byteLength
    });
    return json({ data });
  })
});

http.route({
  path: "/admin/registry/sync",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.syncRegistry, body);
    return json({ data });
  })
});

http.route({
  path: "/admin/registry/apps/status",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.setAppStatus, {
      slug: String(body.slug),
      status: body.status === "disabled" ? "disabled" : "active"
    });
    return json({ data });
  })
});

http.route({
  path: "/admin/registry/endpoints/status",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.setEndpointStatus, {
      method: String(body.method),
      path: String(body.path),
      status: body.status === "disabled" ? "disabled" : "active"
    });
    return json({ data });
  })
});

http.route({
  path: "/admin/registry/responses",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.createResponse, {
      appSlug: String(body.appSlug),
      method: String(body.method),
      path: String(body.path),
      name: String(body.name),
      statusCode: Number(body.statusCode),
      body: String(body.body)
    });
    return json({ data });
  })
});

http.route({
  path: "/admin/registry/responses/delete",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.deleteResponse, {
      id: String(body.id)
    });
    return json({ data });
  })
});

http.route({
  path: "/admin/api-keys",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const apiKey = generateApiKey();
    const data = await ctx.runMutation(api.state.createApiKey, {
      name: String(body.name ?? "Untitled key"),
      prefix: apiKeyPrefix(apiKey),
      keyHash: await hashApiKey(apiKey)
    });
    return json({ data: { ...data, apiKey } });
  })
});

http.route({
  path: "/admin/api-keys/revoke",
  method: "POST",
  handler: internalHttpAction(async (ctx, request) => {
    const body = await request.json();
    const data = await ctx.runMutation(api.state.revokeApiKey, {
      id: String(body.id)
    });
    return json({ data });
  })
});

function internalHttpAction(
  handler: Parameters<typeof httpAction>[0]
): ReturnType<typeof httpAction> {
  return httpAction(async (ctx, request) => {
    if (!isInternal(request)) {
      return json({ error: "Unauthorized" }, 401);
    }

    try {
      return await handler(ctx, request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Convex action failed.";
      const status = message.toLowerCase().includes("not found") ? 404 : 400;
      return json({ error: message }, status);
    }
  });
}

function isInternal(request: Request): boolean {
  const expected = process.env.INTERNAL_API_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const actual = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  return Boolean(expected && safeEqual(actual, expected));
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `dak_${bytesToHex(bytes)}`;
}

async function hashApiKey(apiKey: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(apiKey));
  return bytesToHex(new Uint8Array(digest));
}

function apiKeyPrefix(apiKey: string): string {
  const [prefix, token] = apiKey.split("_");
  return `${prefix}_${token?.slice(0, 8) ?? "unknown"}`;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return diff === 0;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default http;
