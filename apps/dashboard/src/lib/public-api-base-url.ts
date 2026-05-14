import { headers } from "next/headers";

export async function getPublicApiBaseUrl(): Promise<string> {
  if (process.env.API_PUBLIC_BASE_URL) {
    return process.env.API_PUBLIC_BASE_URL.replace(/\/+$/, "");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    return "http://localhost:9998";
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`.replace(/\/+$/, "");
}
