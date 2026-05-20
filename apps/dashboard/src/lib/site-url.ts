export function getConfiguredSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.API_PUBLIC_BASE_URL ?? "http://localhost:9998").replace(/\/+$/, "");
}
