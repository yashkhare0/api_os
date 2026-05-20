import { HttpError, upstreamError } from "./http-error";

export type AllowedUpstreamRequest = {
  upstreamName: string;
  baseUrl: string;
  allowedResources: ReadonlySet<string>;
  resource: string;
  pathSegments?: string[];
  query?: URLSearchParams;
  timeoutMs: number;
};

export async function fetchAllowedUpstreamJson(input: AllowedUpstreamRequest): Promise<unknown> {
  if (!input.allowedResources.has(input.resource)) {
    throw upstreamError("Requested upstream resource is not allowed.", {
      resource: input.resource,
      allowedResources: Array.from(input.allowedResources).sort()
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const response = await fetch(upstreamUrl(input), {
      signal: controller.signal,
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw upstreamError(`${input.upstreamName} returned an unsuccessful response.`, {
        upstreamStatusCode: response.status
      });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw upstreamError(`${input.upstreamName} returned a non-JSON response.`, {
        contentType: contentType || "unknown"
      });
    }

    return response.json();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw upstreamError(`${input.upstreamName} request timed out.`, {
        timeoutMs: input.timeoutMs
      });
    }

    throw upstreamError(`${input.upstreamName} request failed.`, {
      cause: error instanceof Error ? error.name : "unknown"
    });
  } finally {
    clearTimeout(timeout);
  }
}

function upstreamUrl(input: Pick<AllowedUpstreamRequest, "baseUrl" | "resource" | "pathSegments" | "query">): URL {
  const encodedPath = [input.resource, ...(input.pathSegments ?? [])].map(encodeURIComponent).join("/");
  const url = new URL(`${input.baseUrl.replace(/\/+$/, "")}/${encodedPath}`);

  for (const [name, value] of input.query ?? new URLSearchParams()) {
    url.searchParams.set(name, value);
  }

  return url;
}
