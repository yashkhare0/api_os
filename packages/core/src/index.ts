import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type ApiKeyStatus = "active" | "revoked";

export type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  keyHash: string;
  status: ApiKeyStatus;
  createdAt: number;
  revokedAt?: number;
};

export type VerticalJourney = "catalog" | "cart" | "booking" | "checkout" | "financing" | "order" | "passthrough";

export type VerticalMetadata = {
  slug: string;
  name: string;
  description: string;
  journey: VerticalJourney[];
  endpoints: string[];
  media: string[];
  upstream?: {
    name: string;
    baseUrl: string;
  };
};

export type UsageEvent = {
  apiKeyId: string;
  verticalSlug: string;
  endpoint: string;
  method: string;
  statusCode: number;
  durationMs: number;
  occurredAt: number;
};

export type UsageSummary = {
  verticalSlug: string;
  requests: number;
  errors: number;
  p95Ms: number;
};

export type CartItem = {
  itemId: string;
  quantity: number;
  unitPrice: number;
};

export type CartRecord = {
  id: string;
  verticalSlug: string;
  apiKeyId: string;
  items: CartItem[];
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
};

export function generateApiKey(prefix = "dak"): string {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey, "utf8").digest("hex");
}

export function apiKeyPrefix(apiKey: string): string {
  const [prefix, token] = apiKey.split("_");
  if (!prefix || !token) {
    return "unknown";
  }

  return `${prefix}_${token.slice(0, 8)}`;
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function now(): number {
  return Date.now();
}

export function dayBucket(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}
