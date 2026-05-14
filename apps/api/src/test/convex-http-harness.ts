import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { endpointContracts } from "@dummy-api/contracts";
import {
  apiKeyPrefix,
  generateApiKey,
  hashApiKey,
  type ApiKeyRecord,
  type CartRecord,
  type UsageEvent
} from "@dummy-api/core";
import { verticals } from "@dummy-api/catalog";
import type {
  BookingRecord,
  CheckoutRecord,
  EcommerceOrderRecord,
  FinancingPrequalificationRecord
} from "../types";

type HarnessState = {
  apiKeys: Map<string, ApiKeyRecord>;
  carts: Map<string, CartRecord>;
  bookings: Map<string, BookingRecord>;
  checkouts: CheckoutRecord[];
  financingPrequalifications: Map<string, FinancingPrequalificationRecord>;
  orders: Map<string, EcommerceOrderRecord>;
  responses: Map<string, HarnessResponse>;
  usageEvents: UsageEvent[];
  apps: Map<string, HarnessApp>;
  endpoints: Map<string, HarnessEndpoint>;
  appStatuses: Map<string, "active" | "disabled">;
  endpointStatuses: Map<string, "active" | "disabled">;
};

type HarnessStatus = "active" | "disabled";

type HarnessApp = {
  id: string;
  slug: string;
  name: string;
  description: string;
  journey: string[];
  media: string[];
  status: HarnessStatus;
  createdAt: number;
  updatedAt: number;
};

type HarnessEndpoint = {
  id: string;
  appSlug: string;
  contractId: string;
  method: string;
  path: string;
  status: HarnessStatus;
  createdAt: number;
  updatedAt: number;
};

type HarnessResponse = {
  id: string;
  appSlug: string;
  method: string;
  path: string;
  name: string;
  statusCode: number;
  body: string;
  status: "active" | "disabled";
  createdAt: number;
  updatedAt: number;
};

export type ConvexHttpHarness = {
  url: string;
  state: HarnessState;
  close(): Promise<void>;
};

export async function startConvexHttpHarness(options: {
  apiKey: string;
  internalSecret: string;
  port?: number;
}): Promise<ConvexHttpHarness> {
  const timestamp = Date.now();
  const initialApiKey: ApiKeyRecord = {
    id: "test-api-key",
    name: "Contract Test Key",
    prefix: apiKeyPrefix(options.apiKey),
    keyHash: hashApiKey(options.apiKey),
    status: "active",
    createdAt: timestamp
  };
  const state: HarnessState = {
    apiKeys: new Map([[initialApiKey.id, initialApiKey]]),
    carts: new Map(),
    bookings: new Map(),
    checkouts: [],
    financingPrequalifications: new Map(),
    orders: new Map(),
    responses: new Map(),
    usageEvents: [],
    apps: new Map(
      verticals.map((vertical) => [
        vertical.slug,
        {
          id: `app-${vertical.slug}`,
          slug: vertical.slug,
          name: vertical.name,
          description: vertical.description,
          journey: [...vertical.journey],
          media: [...vertical.media],
          status: "active",
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ])
    ),
    endpoints: new Map(
      endpointContracts.map((contract) => [
        signature(contract.method, contract.path),
        {
          id: `endpoint-${contract.id}`,
          appSlug: contract.verticalSlug,
          contractId: contract.id,
          method: contract.method,
          path: contract.path,
          status: "active",
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ])
    ),
    appStatuses: new Map(endpointContracts.map((contract) => [contract.verticalSlug, "active"])),
    endpointStatuses: new Map(endpointContracts.map((contract) => [signature(contract.method, contract.path), "active"]))
  };

  const server = createServer(async (request, response) => {
    if (!isAuthorized(request, options.internalSecret)) {
      sendJson(response, 401, { error: "Unauthorized" });
      return;
    }

    const body = await readJson(request);
    const path = request.url?.split("?")[0] ?? "/";

    try {
      switch (path) {
        case "/auth/validate-key": {
          const record = Array.from(state.apiKeys.values()).find(
            (apiKey) => apiKey.keyHash === body.keyHash && apiKey.status === "active"
          );
          if (!record) {
            sendJson(response, 200, { data: null });
            return;
          }

          sendJson(response, 200, {
            data: {
              apiKeyId: record.id,
              apiKeyPrefix: record.prefix,
              name: record.name
            }
          });
          return;
        }
        case "/usage/record": {
          state.usageEvents.push(body as UsageEvent);
          sendJson(response, 200, { data: null });
          return;
        }
        case "/registry/resolve": {
          const method = String(body.method);
          const path = String(body.path);
          const endpoint = state.endpoints.get(signature(method, path));
          const endpointStatus = state.endpointStatuses.get(signature(method, path));
          const appStatus = endpoint ? state.appStatuses.get(endpoint.appSlug) : undefined;
          sendJson(response, 200, {
            data: {
              live: Boolean(endpoint && endpointStatus === "active" && appStatus === "active"),
              appStatus,
              endpointStatus
            }
          });
          return;
        }
        case "/admin/summary": {
          sendJson(response, 200, {
            data: {
              apiKeys: Array.from(state.apiKeys.values()).map(serializeApiKey),
              usage: usageSummary(state.usageEvents),
              state: {
                activeCarts: Array.from(state.carts.values()).filter((cart) => cart.expiresAt > Date.now()).length,
                activeBookings: Array.from(state.bookings.values()).filter((booking) => booking.expiresAt > Date.now())
                  .length,
                activePrequalifications: Array.from(state.financingPrequalifications.values()).filter(
                  (prequalification) => prequalification.expiresAt > Date.now()
                ).length,
                checkouts: state.checkouts.length,
                orders: state.orders.size
              },
              registry: {
                apps: Array.from(state.apps.values()),
                endpoints: Array.from(state.endpoints.values()),
                responses: Array.from(state.responses.values())
              }
            }
          });
          return;
        }
        case "/admin/registry/sync": {
          const now = Date.now();
          const apps = Array.isArray(body.apps) ? body.apps : [];
          const endpoints = Array.isArray(body.endpoints) ? body.endpoints : [];

          for (const app of apps) {
            const input = app as {
              slug?: unknown;
              name?: unknown;
              description?: unknown;
              journey?: unknown;
              media?: unknown;
            };
            const slug = String(input.slug);
            const existing = state.apps.get(slug);
            state.apps.set(slug, {
              id: existing?.id ?? `app-${slug}`,
              slug,
              name: String(input.name),
              description: String(input.description),
              journey: Array.isArray(input.journey) ? input.journey.map(String) : [],
              media: Array.isArray(input.media) ? input.media.map(String) : [],
              status: existing?.status ?? "active",
              createdAt: existing?.createdAt ?? now,
              updatedAt: now
            });
            state.appStatuses.set(slug, existing?.status ?? "active");
          }

          for (const endpoint of endpoints) {
            const input = endpoint as { contractId?: unknown; appSlug?: unknown; method?: unknown; path?: unknown };
            const method = String(input.method);
            const endpointPath = String(input.path);
            const key = signature(method, endpointPath);
            const existing = state.endpoints.get(key);
            state.endpoints.set(key, {
              id: existing?.id ?? `endpoint-${String(input.contractId)}`,
              appSlug: String(input.appSlug),
              contractId: String(input.contractId),
              method,
              path: endpointPath,
              status: existing?.status ?? "active",
              createdAt: existing?.createdAt ?? now,
              updatedAt: now
            });
            state.endpointStatuses.set(key, existing?.status ?? "active");
          }

          sendJson(response, 200, { data: { apps: apps.length, endpoints: endpoints.length } });
          return;
        }
        case "/admin/api-keys": {
          const apiKey = generateApiKey();
          const record: ApiKeyRecord = {
            id: randomUUID(),
            name: String(body.name ?? "Untitled key"),
            prefix: apiKeyPrefix(apiKey),
            keyHash: hashApiKey(apiKey),
            status: "active",
            createdAt: Date.now()
          };
          state.apiKeys.set(record.id, record);
          sendJson(response, 200, { data: { ...serializeApiKey(record), apiKey } });
          return;
        }
        case "/admin/api-keys/revoke": {
          const id = String(body.id);
          const record = state.apiKeys.get(id);
          if (!record) {
            sendJson(response, 404, { error: "API key was not found." });
            return;
          }

          const updated: ApiKeyRecord = { ...record, status: "revoked", revokedAt: Date.now() };
          state.apiKeys.set(id, updated);
          sendJson(response, 200, { data: serializeApiKey(updated) });
          return;
        }
        case "/admin/registry/apps/status": {
          const slug = String(body.slug);
          const status: HarnessStatus = body.status === "disabled" ? "disabled" : "active";
          const app = state.apps.get(slug);
          if (!app) {
            sendJson(response, 404, { error: "App was not found." });
            return;
          }

          const updated = { ...app, status, updatedAt: Date.now() };
          state.apps.set(slug, updated);
          state.appStatuses.set(slug, status);
          sendJson(response, 200, { data: updated });
          return;
        }
        case "/admin/registry/endpoints/status": {
          const key = signature(String(body.method), String(body.path));
          const status: HarnessStatus = body.status === "disabled" ? "disabled" : "active";
          const endpoint = state.endpoints.get(key);
          if (!endpoint) {
            sendJson(response, 404, { error: "Endpoint was not found." });
            return;
          }

          const updated = { ...endpoint, status, updatedAt: Date.now() };
          state.endpoints.set(key, updated);
          state.endpointStatuses.set(
            key,
            status
          );
          sendJson(response, 200, { data: updated });
          return;
        }
        case "/admin/registry/responses": {
          const parsedBody = String(body.body ?? "");
          JSON.parse(parsedBody);
          const saved: HarnessResponse = {
            id: randomUUID(),
            appSlug: String(body.appSlug),
            method: String(body.method),
            path: String(body.path),
            name: String(body.name),
            statusCode: Number(body.statusCode),
            body: parsedBody,
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          state.responses.set(saved.id, saved);
          sendJson(response, 200, { data: saved });
          return;
        }
        case "/admin/registry/responses/delete": {
          const id = String(body.id);
          state.responses.delete(id);
          sendJson(response, 200, { data: { id } });
          return;
        }
        case "/journeys/carts": {
          const timestamp = Date.now();
          const cart: CartRecord = {
            id: randomUUID(),
            verticalSlug: String(body.verticalSlug),
            apiKeyId: String(body.apiKeyId),
            items: [],
            createdAt: timestamp,
            updatedAt: timestamp,
            expiresAt: timestamp + 1_800_000
          };
          state.carts.set(cart.id, cart);
          sendJson(response, 200, { data: cart });
          return;
        }
        case "/journeys/carts/get": {
          sendJson(response, 200, {
            data: findCart(state, String(body.cartId), String(body.verticalSlug), String(body.apiKeyId))
          });
          return;
        }
        case "/journeys/carts/items": {
          const cart = findCart(state, String(body.cartId), String(body.verticalSlug), String(body.apiKeyId));
          if (!cart) {
            sendJson(response, 404, { error: "Cart was not found." });
            return;
          }

          const existing = cart.items.find((item) => item.itemId === body.itemId);
          if (existing) {
            existing.quantity += Number(body.quantity);
          } else {
            cart.items.push({
              itemId: String(body.itemId),
              quantity: Number(body.quantity),
              unitPrice: Number(body.unitPrice)
            });
          }
          cart.updatedAt = Date.now();
          sendJson(response, 200, { data: cart });
          return;
        }
        case "/journeys/checkouts": {
          const cart = findCart(state, String(body.cartId), String(body.verticalSlug), String(body.apiKeyId));
          if (!cart) {
            sendJson(response, 404, { error: "Cart was not found." });
            return;
          }

          if (cart.items.length === 0) {
            sendJson(response, 400, { error: "Cart must contain at least one item before checkout." });
            return;
          }

          const checkout: CheckoutRecord = {
            id: randomUUID(),
            verticalSlug: cart.verticalSlug,
            apiKeyId: cart.apiKeyId,
            cartId: cart.id,
            total: cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
            status: "confirmed",
            createdAt: Date.now()
          };
          state.carts.delete(cart.id);
          state.checkouts.push(checkout);
          sendJson(response, 200, { data: checkout });
          return;
        }
        case "/journeys/checkouts/get": {
          const checkout = state.checkouts.find(
            (item) =>
              item.id === String(body.checkoutId) &&
              item.verticalSlug === String(body.verticalSlug) &&
              item.apiKeyId === String(body.apiKeyId)
          );
          sendJson(response, 200, { data: checkout ?? null });
          return;
        }
        case "/journeys/bookings": {
          if (Date.parse(String(body.startDate)) >= Date.parse(String(body.endDate))) {
            sendJson(response, 400, { error: "endDate must be after startDate." });
            return;
          }

          const timestamp = Date.now();
          const booking: BookingRecord = {
            id: randomUUID(),
            verticalSlug: String(body.verticalSlug),
            apiKeyId: String(body.apiKeyId),
            itemId: String(body.itemId),
            startDate: String(body.startDate),
            endDate: String(body.endDate),
            ...(body.guestName ? { guestName: String(body.guestName) } : {}),
            total: Number(body.total),
            status: "confirmed",
            expiresAt: timestamp + 3_600_000,
            createdAt: timestamp
          };
          state.bookings.set(booking.id, booking);
          sendJson(response, 200, { data: booking });
          return;
        }
        case "/journeys/financing-prequalifications": {
          const timestamp = Date.now();
          const prequalification: FinancingPrequalificationRecord = {
            id: randomUUID(),
            verticalSlug: String(body.verticalSlug),
            apiKeyId: String(body.apiKeyId),
            listingId: String(body.listingId),
            ...(body.applicantName ? { applicantName: String(body.applicantName) } : {}),
            annualIncome: Number(body.annualIncome),
            downPayment: Number(body.downPayment),
            creditRating: normalizeCreditRating(body.creditRating),
            termMonths: Number(body.termMonths),
            apr: Number(body.apr),
            amountFinanced: Number(body.amountFinanced),
            estimatedMonthlyPayment: Number(body.estimatedMonthlyPayment),
            status: body.status === "qualified" ? "qualified" : "review_required",
            expiresAt: timestamp + 3_600_000,
            createdAt: timestamp
          };
          state.financingPrequalifications.set(prequalification.id, prequalification);
          sendJson(response, 200, { data: prequalification });
          return;
        }
        case "/journeys/financing-prequalifications/get": {
          const prequalification = state.financingPrequalifications.get(String(body.id));
          if (
            !prequalification ||
            prequalification.verticalSlug !== String(body.verticalSlug) ||
            prequalification.apiKeyId !== String(body.apiKeyId) ||
            prequalification.expiresAt <= Date.now()
          ) {
            sendJson(response, 200, { data: null });
            return;
          }

          sendJson(response, 200, { data: prequalification });
          return;
        }
        case "/journeys/orders": {
          const checkout = state.checkouts.find(
            (item) =>
              item.id === String(body.checkoutId) &&
              item.verticalSlug === String(body.verticalSlug) &&
              item.apiKeyId === String(body.apiKeyId)
          );
          if (!checkout) {
            sendJson(response, 404, { error: "Checkout was not found." });
            return;
          }

          const order: EcommerceOrderRecord = {
            id: randomUUID(),
            verticalSlug: String(body.verticalSlug),
            apiKeyId: String(body.apiKeyId),
            checkoutId: String(body.checkoutId),
            items: Array.isArray(body.items)
              ? body.items.map((item) => ({
                  itemId: String((item as { itemId?: unknown }).itemId),
                  quantity: Number((item as { quantity?: unknown }).quantity),
                  unitPrice: Number((item as { unitPrice?: unknown }).unitPrice)
                }))
              : [],
            subtotal: Number(body.subtotal),
            total: Number(body.total),
            ...(body.customerEmail ? { customerEmail: String(body.customerEmail) } : {}),
            ...(body.shippingPostalCode ? { shippingPostalCode: String(body.shippingPostalCode) } : {}),
            status: "confirmed",
            createdAt: Date.now()
          };
          state.orders.set(order.id, order);
          sendJson(response, 200, { data: order });
          return;
        }
        case "/journeys/orders/get": {
          const order = state.orders.get(String(body.orderId));
          if (
            !order ||
            order.verticalSlug !== String(body.verticalSlug) ||
            order.apiKeyId !== String(body.apiKeyId)
          ) {
            sendJson(response, 200, { data: null });
            return;
          }

          sendJson(response, 200, { data: order });
          return;
        }
        default:
          sendJson(response, 404, { error: `Unhandled harness path: ${path}` });
      }
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : "Harness failure" });
    }
  });

  await listen(server, options.port);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Harness server did not bind to a TCP port.");
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    state,
    close: () => close(server)
  };
}

function signature(method: string, path: string): string {
  return `${method} ${path}`;
}

function normalizeCreditRating(value: unknown): "excellent" | "good" | "fair" | "building" {
  return value === "excellent" || value === "good" || value === "fair" || value === "building" ? value : "fair";
}

function serializeApiKey(record: ApiKeyRecord) {
  return {
    id: record.id,
    name: record.name,
    prefix: record.prefix,
    status: record.status,
    createdAt: record.createdAt,
    revokedAt: record.revokedAt
  };
}

function usageSummary(events: UsageEvent[]) {
  const byVertical = new Map<string, { requests: number; errors: number; durations: number[] }>();
  for (const event of events) {
    const current = byVertical.get(event.verticalSlug) ?? { requests: 0, errors: 0, durations: [] };
    current.requests += 1;
    if (event.statusCode >= 400) {
      current.errors += 1;
    }
    current.durations.push(event.durationMs);
    byVertical.set(event.verticalSlug, current);
  }

  return Array.from(byVertical.entries()).map(([verticalSlug, value]) => ({
    verticalSlug,
    requests: value.requests,
    errors: value.errors,
    p95Ms: percentile(value.durations, 95)
  }));
}

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

function findCart(
  state: HarnessState,
  cartId: string,
  verticalSlug: string,
  apiKeyId: string
): CartRecord | null {
  const cart = state.carts.get(cartId);
  if (!cart || cart.verticalSlug !== verticalSlug || cart.apiKeyId !== apiKeyId) {
    return null;
  }

  return cart;
}

function isAuthorized(request: IncomingMessage, internalSecret: string): boolean {
  return request.headers.authorization === `Bearer ${internalSecret}`;
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function listen(server: Server, port = 0): Promise<void> {
  await new Promise<void>((resolve) => {
    server.listen(port, "127.0.0.1", resolve);
  });
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
