import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import staticFiles from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import { now, type UsageEvent } from "@dummy-api/core";
import { authenticateRequest } from "./lib/auth";
import type { ApiConfig } from "./lib/config";
import { getConfig } from "./lib/config";
import { HttpError, endpointDisabled } from "./lib/http-error";
import { getStateStore, type StateStore } from "./lib/state-store";
import { registerVerticalRoutes } from "./verticals";
import type { AuthenticatedRequest } from "./types";

export type BuildAppOptions = {
  config?: ApiConfig;
  store?: StateStore;
  logger?: boolean;
  assetsRoot?: string;
};

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? getConfig();
  const store = options.store ?? getStateStore(config);
  const app = Fastify({
    logger: options.logger ?? true,
    trustProxy: true,
    ajv: {
      customOptions: {
        removeAdditional: "all",
        coerceTypes: true,
        useDefaults: true
      }
    }
  });

  await app.register(helmet, {
    global: true,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  });
  await app.register(cors, {
    origin: config.corsOrigin === "*" ? true : config.corsOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["authorization", "content-type", "x-api-key"]
  });
  await app.register(rateLimit, {
    max: 600,
    timeWindow: "1 minute"
  });

  const publicRoot = options.assetsRoot ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");
  await app.register(staticFiles, {
    root: publicRoot,
    prefix: "/assets/",
    decorateReply: false,
    immutable: true,
    maxAge: "1 day"
  });

  app.addHook("onRequest", async (request) => {
    (request as AuthenticatedRequest).requestStartedAt = now();
  });

  app.addHook("preHandler", async (request) => {
    if (!request.url.startsWith("/v1")) {
      return;
    }

    (request as AuthenticatedRequest).auth = await authenticateRequest(request, store);

    if (request.url.split("?")[0] === "/v1") {
      return;
    }

    const access = await store.resolveEndpoint({
      method: request.method,
      path: routePattern(request)
    });

    if (!access.live) {
      throw endpointDisabled();
    }
  });

  app.addHook("onResponse", async (request, reply) => {
    if (!request.url.startsWith("/v1")) {
      return;
    }

    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.auth) {
      return;
    }

    const event: UsageEvent = {
      apiKeyId: authRequest.auth.apiKeyId,
      verticalSlug: verticalFromUrl(request.url),
      endpoint: routePattern(request),
      method: request.method,
      statusCode: reply.statusCode,
      durationMs: Math.max(0, now() - authRequest.requestStartedAt),
      occurredAt: now()
    };

    try {
      await store.recordUsage(event);
    } catch (error) {
      request.log.error({ err: error, usageEvent: event }, "failed to record usage event");
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
      return;
    }

    if (typeof error === "object" && error !== null && "validation" in error) {
      reply.status(400).send({
        error: {
          code: "validation_error",
          message: "Request validation failed.",
          details: error.validation
        }
      });
      return;
    }

    request.log.error({ err: error }, "unhandled request error");
    reply.status(500).send({
      error: {
        code: "internal_error",
        message: "An unexpected error occurred."
      }
    });
  });

  app.get("/health/live", async () => ({ ok: true }));
  app.get("/health/ready", async () => ({
    ok: true,
    dependencies: {
      convex: "configured"
    }
  }));

  await registerVerticalRoutes(app, { config, store });

  return app;
}

function verticalFromUrl(url: string): string {
  const parts = url.split("?")[0]?.split("/").filter(Boolean) ?? [];
  return parts[1] ?? "unknown";
}

function routePattern(request: { routeOptions?: { url?: string | undefined }; url: string }): string {
  return request.routeOptions?.url ?? request.url.split("?")[0] ?? request.url;
}
