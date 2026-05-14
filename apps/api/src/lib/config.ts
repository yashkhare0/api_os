export type ApiConfig = {
  apiBaseUrl: string;
  convexHttpUrl: string;
  internalApiSecret: string;
  corsOrigin: string;
  pokeApiBaseUrl: string;
  port: number;
};

export function getConfig(): ApiConfig {
  const convexHttpUrl = cleanUrl(process.env.CONVEX_HTTP_URL);
  const internalApiSecret = process.env.INTERNAL_API_SECRET;

  if (!convexHttpUrl) {
    throw new Error("CONVEX_HTTP_URL is required. Run Convex locally with `pnpm convex:dev` or set the deployed Convex HTTP URL.");
  }

  if (!internalApiSecret) {
    throw new Error("INTERNAL_API_SECRET is required for API-to-Convex writes.");
  }

  return {
    apiBaseUrl: process.env.API_PUBLIC_BASE_URL ?? "http://localhost:9998",
    convexHttpUrl,
    internalApiSecret,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:9998",
    pokeApiBaseUrl: cleanUrl(process.env.POKEAPI_BASE_URL) ?? "https://pokeapi.co/api/v2",
    port: Number(process.env.PORT ?? 9999)
  };
}

function cleanUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.replace(/\/+$/, "");
}
