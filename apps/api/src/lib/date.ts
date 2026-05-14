import { badRequest } from "./http-error";

export function parseIsoDate(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw badRequest(`${field} is required.`);
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw badRequest(`${field} must be a valid ISO date.`);
  }

  return new Date(timestamp).toISOString();
}
