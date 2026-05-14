import "server-only";
import { cache } from "react";
import type { AdminSummary, ApiApp, ApiEndpoint, ApiResponse } from "@/lib/admin-api";
import { getAdminSummary, syncRegistry } from "@/lib/admin-api";

export type DashboardSummaryResult =
  | { ok: true; summary: AdminSummary }
  | { ok: false; error: string };

export const getDashboardSummary = cache(async (): Promise<AdminSummary> => {
  await syncRegistry();
  return getAdminSummary();
});

export async function getDashboardSummaryResult(): Promise<DashboardSummaryResult> {
  try {
    return { ok: true, summary: await getDashboardSummary() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Dashboard data could not be loaded."
    };
  }
}

export function getApp(summary: AdminSummary, appSlug: string): ApiApp | undefined {
  return summary.registry.apps.find((app) => app.slug === appSlug);
}

export function getEndpoint(summary: AdminSummary, endpointId: string): ApiEndpoint | undefined {
  return summary.registry.endpoints.find((endpoint) => endpoint.id === endpointId);
}

export function endpointsForApp(summary: AdminSummary, appSlug: string): ApiEndpoint[] {
  return summary.registry.endpoints.filter((endpoint) => endpoint.appSlug === appSlug);
}

export function responsesForEndpoint(summary: AdminSummary, endpoint: Pick<ApiEndpoint, "method" | "path">): ApiResponse[] {
  return summary.registry.responses.filter(
    (response) => response.method === endpoint.method && response.path === endpoint.path
  );
}

export function responsesForApp(summary: AdminSummary, appSlug: string): ApiResponse[] {
  return summary.registry.responses.filter((response) => response.appSlug === appSlug);
}

export function usageForApp(summary: AdminSummary, appSlug: string) {
  return summary.usage.find((item) => item.verticalSlug === appSlug);
}

export function appName(summary: AdminSummary, appSlug: string): string {
  return getApp(summary, appSlug)?.name ?? appSlug;
}
