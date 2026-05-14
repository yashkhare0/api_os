import path from "node:path";
import { buildApp } from "@dummy-api/api/app";
import { getConfig } from "@dummy-api/api/config";

type EmbeddedApi = Awaited<ReturnType<typeof buildApp>>;
type EmbeddedApiResponse = {
  body: string;
  headers: Record<string, number | string | string[] | undefined>;
  rawPayload?: Buffer;
  statusCode: number;
};
type InjectableApi = {
  inject(options: {
    headers: Record<string, string>;
    method: string;
    payload?: Buffer;
    url: string;
  }): Promise<EmbeddedApiResponse>;
};

const globalForApi = globalThis as typeof globalThis & {
  __dummyApiApps?: Map<string, Promise<EmbeddedApi>>;
};

export async function handleEmbeddedApiRequest(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const app = await getEmbeddedApi(requestUrl.origin);
  const payload = ["GET", "HEAD"].includes(request.method) ? undefined : Buffer.from(await request.arrayBuffer());
  const injectOptions = {
    method: request.method,
    url: `${requestUrl.pathname}${requestUrl.search}`,
    headers: Object.fromEntries(request.headers.entries()),
    ...(payload ? { payload } : {})
  };
  const response = await (app as InjectableApi).inject(injectOptions);
  const responseBody = response.rawPayload
    ? (new Uint8Array(response.rawPayload) as BodyInit)
    : response.body;

  return new Response(responseBody, {
    status: response.statusCode,
    headers: responseHeaders(response.headers)
  });
}

async function getEmbeddedApi(origin: string): Promise<EmbeddedApi> {
  globalForApi.__dummyApiApps ??= new Map();

  const cached = globalForApi.__dummyApiApps.get(origin);

  if (cached) {
    return cached;
  }

  const config = {
    ...getConfig(),
    apiBaseUrl: origin,
    corsOrigin: process.env.CORS_ORIGIN ?? origin
  };
  const assetsRoot = path.resolve(process.cwd(), "../api/public/assets");
  const appPromise = buildApp({ assetsRoot, config, logger: false });
  globalForApi.__dummyApiApps.set(origin, appPromise);
  return appPromise;
}

function responseHeaders(headers: Record<string, number | string | string[] | undefined>): Headers {
  const nextHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined || name.toLowerCase() === "content-length") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        nextHeaders.append(name, item);
      }
      continue;
    }

    nextHeaders.set(name, String(value));
  }

  return nextHeaders;
}
