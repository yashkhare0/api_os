import type { ApiEndpoint } from "@/lib/admin-api";

export function appHref(appSlug: string): string {
  return `/dashboard/apps/${encodeURIComponent(appSlug)}`;
}

export function openApiHref(appSlug: string): string {
  return `${appHref(appSlug)}/openapi.json`;
}

export function endpointHref(endpoint: ApiEndpoint): string {
  return `${appHref(endpoint.appSlug)}/apis/${encodeURIComponent(endpoint.id)}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

export function formatJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function pathWithExampleParams(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
    if (name.toLowerCase().includes("cart")) {
      return "cart_demo";
    }
    if (name.toLowerCase() === "name") {
      return "pikachu";
    }
    return `${name}_demo`;
  });
}

export function pathParamNames(path: string): string[] {
  return Array.from(path.matchAll(/:([A-Za-z0-9_]+)/g), (match) => match[1]).filter(
    (name): name is string => Boolean(name)
  );
}
