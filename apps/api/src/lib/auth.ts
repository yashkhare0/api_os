import type { FastifyRequest } from "fastify";
import { apiKeyPrefix, hashApiKey } from "@dummy-api/core";
import { unauthorized } from "./http-error";
import type { StateStore } from "./state-store";

export async function authenticateRequest(request: FastifyRequest, store: StateStore) {
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    throw unauthorized();
  }

  const auth = await store.validateApiKey({
    keyHash: hashApiKey(apiKey),
    prefix: apiKeyPrefix(apiKey)
  });

  if (!auth) {
    throw unauthorized("The supplied API key is invalid or revoked.");
  }

  return auth;
}

function extractApiKey(request: FastifyRequest): string | undefined {
  const direct = request.headers["x-api-key"];
  if (typeof direct === "string" && direct.trim().length > 0) {
    return direct.trim();
  }

  const authorization = request.headers.authorization;
  if (!authorization) {
    return undefined;
  }

  const [scheme, value] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) {
    return undefined;
  }

  return value.trim();
}
