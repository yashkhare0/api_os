import "server-only";
import type { ApiKeyStatus, UsageSummary } from "@dummy-api/core";
import { endpointContracts } from "@dummy-api/contracts";
import { verticals } from "@dummy-api/catalog";

export type AdminApiKey = {
  id: string;
  name: string;
  prefix: string;
  status: ApiKeyStatus;
  createdAt: number;
  revokedAt?: number;
};

export type AdminSummary = {
  apiKeys: AdminApiKey[];
  usage: UsageSummary[];
  state: {
    activeCarts: number;
    activeBookings: number;
    activePrequalifications: number;
    checkouts: number;
    orders: number;
  };
  registry: {
    apps: ApiApp[];
    endpoints: ApiEndpoint[];
    responses: ApiResponse[];
  };
};

export type ApiStatus = "active" | "disabled";

export type ApiApp = {
  id: string;
  slug: string;
  name: string;
  description: string;
  journey: string[];
  media: string[];
  status: ApiStatus;
  createdAt: number;
  updatedAt: number;
};

export type ApiEndpoint = {
  id: string;
  appSlug: string;
  contractId: string;
  method: string;
  path: string;
  status: ApiStatus;
  createdAt: number;
  updatedAt: number;
};

export type ApiResponse = {
  id: string;
  appSlug: string;
  method: string;
  path: string;
  name: string;
  statusCode: number;
  body: string;
  status: ApiStatus;
  createdAt: number;
  updatedAt: number;
};

export async function syncRegistry(): Promise<void> {
  await convexRequest<{ data: { apps: number; endpoints: number } }>("/admin/registry/sync", {
    method: "POST",
    body: JSON.stringify({
      apps: verticals.map((vertical) => ({
        slug: vertical.slug,
        name: vertical.name,
        description: vertical.description,
        journey: vertical.journey,
        media: vertical.media
      })),
      endpoints: endpointContracts.map((contract) => ({
        contractId: contract.id,
        appSlug: contract.verticalSlug,
        method: contract.method,
        path: contract.path
      }))
    })
  });
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const response = await convexRequest<{ data: AdminSummary }>("/admin/summary", {
    method: "GET",
    cache: "no-store"
  });

  return response.data;
}

export async function createApiKey(name: string): Promise<AdminApiKey & { apiKey: string }> {
  const response = await convexRequest<{ data: AdminApiKey & { apiKey: string } }>("/admin/api-keys", {
    method: "POST",
    body: JSON.stringify({ name })
  });

  return response.data;
}

export async function revokeApiKey(id: string): Promise<AdminApiKey> {
  const response = await convexRequest<{ data: AdminApiKey }>("/admin/api-keys/revoke", {
    method: "POST",
    body: JSON.stringify({ id })
  });

  return response.data;
}

export async function setAppStatus(slug: string, status: ApiStatus): Promise<ApiApp> {
  const response = await convexRequest<{ data: ApiApp }>("/admin/registry/apps/status", {
    method: "POST",
    body: JSON.stringify({ slug, status })
  });

  return response.data;
}

export async function setEndpointStatus(method: string, path: string, status: ApiStatus): Promise<ApiEndpoint> {
  const response = await convexRequest<{ data: ApiEndpoint }>("/admin/registry/endpoints/status", {
    method: "POST",
    body: JSON.stringify({ method, path, status })
  });

  return response.data;
}

export async function createResponse(input: {
  appSlug: string;
  method: string;
  path: string;
  name: string;
  statusCode: number;
  body: string;
}): Promise<ApiResponse> {
  const response = await convexRequest<{ data: ApiResponse }>("/admin/registry/responses", {
    method: "POST",
    body: JSON.stringify(input)
  });

  return response.data;
}

export async function deleteResponse(id: string): Promise<{ id: string }> {
  const response = await convexRequest<{ data: { id: string } }>("/admin/registry/responses/delete", {
    method: "POST",
    body: JSON.stringify({ id })
  });

  return response.data;
}

async function convexRequest<T>(path: string, init: RequestInit): Promise<T> {
  const baseUrl = process.env.CONVEX_HTTP_URL;
  const secret = process.env.INTERNAL_API_SECRET;

  if (!baseUrl || !secret) {
    throw new Error("CONVEX_HTTP_URL and INTERNAL_API_SECRET are required.");
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${secret}`,
      ...init.headers
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? `Convex admin request failed with ${response.status}`);
  }

  return payload as T;
}
