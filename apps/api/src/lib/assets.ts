import type { ApiConfig } from "./config";

export function assetUrl(config: ApiConfig, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.apiBaseUrl}${normalizedPath}`;
}
