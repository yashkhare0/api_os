export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function badRequest(message: string, details?: unknown): HttpError {
  return new HttpError(400, "bad_request", message, details);
}

export function unauthorized(message = "A valid API key is required."): HttpError {
  return new HttpError(401, "unauthorized", message);
}

export function notFound(resource: string): HttpError {
  return new HttpError(404, "not_found", `${resource} was not found.`);
}

export function upstreamError(message: string, details?: unknown): HttpError {
  return new HttpError(502, "upstream_error", message, details);
}

export function endpointDisabled(message = "This API endpoint is disabled."): HttpError {
  return new HttpError(503, "endpoint_disabled", message);
}
