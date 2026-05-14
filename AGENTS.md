# AGENTS.md

You are working in a production TypeScript monorepo for dummy vertical APIs.

## Product Contract

- This platform hosts production-grade dummy APIs for different industry verticals.
- Each vertical is an "app": one cohesive API set, not an external customer integration.
- Public APIs are implemented in `apps/api` through Fastify and embedded by the dashboard app.
- The single deployable app runs in `apps/dashboard` through Next.js App Router and shadcn/ui-style components, serving `/dashboard/*`, `/v1/*`, `/assets/*`, and `/health/*` from one origin.
- Convex is the single runtime state store locally and in production.
- Do not add an alternate in-memory runtime store. Tests should exercise the Convex HTTP boundary.

## Non-Negotiables

- Never store plaintext API keys. Store only hashes and show generated keys once.
- Every public route under `/v1` must require API-key auth.
- Every public route must validate inputs and return structured errors.
- Usage recording failures must be logged and must not crash successful API responses.
- External passthrough APIs must use allowlisted routes, strict timeouts, and normalized errors.
- Dummy media must be stable and served by the platform or by a trusted upstream response.
- Add dependencies only when they are clearly necessary.
- Keep changes small, direct, and consistent with the existing vertical structure.

## When Asked To Build A New Vertical

First inspect the existing verticals in `apps/api/src/verticals` and the shared registry in `packages/catalog/src/index.ts`.

Ask only high-impact questions that cannot be inferred:

- What industry or sub-industry is this vertical for?
- What complete user journey should be represented?
- Which entities are required?
- Which endpoints are required?
- Does it need cart, booking, checkout, or other ephemeral state?
- What image/media types should responses include?
- Is there a fully open-source upstream API to passthrough?
- What dashboard label and usage expectations should appear?

Then implement the vertical end to end:

- Add a folder under `apps/api/src/verticals/{slug}`.
- Add route registration, local dummy data, types, media references, and tests.
- Reuse shared auth, state store, errors, query helpers, and asset helpers.
- Register the vertical routes in `apps/api/src/verticals/index.ts`.
- Register dashboard metadata in `packages/catalog/src/index.ts`.
- Add stable assets under `apps/api/public/assets/{slug}` unless a passthrough upstream owns media.
- Add tests for auth, list/detail/search, journey mutations, and failure paths.
- Run `pnpm --filter @dummy-api/api test` and `pnpm typecheck` at minimum.

## API Architecture Rules

- Keep each vertical self-contained.
- Use `StateStore` for carts, bookings, checkouts, and any ephemeral journey state.
- Do not reach directly into Convex from route modules.
- Do not duplicate API key logic in verticals.
- Keep response shapes predictable: `{ data, meta? }` for success and `{ error }` for failure.
- Prefer bundled dummy catalog data for fast read endpoints.
- Keep passthrough upstreams narrow and explicit.
- Add or change endpoint signatures in `packages/contracts` first.
- Every app and endpoint must be registered in Convex through the registry sync before it is considered live.
- Public API requests must honor Convex app/endpoint status and return `endpoint_disabled` when disabled.

## Dashboard Rules

- Use existing shadcn-style primitives in `apps/dashboard/src/components/ui`.
- Keep dashboard pages server-rendered unless client interactivity is required.
- Revalidate dashboard data after mutations.
- Protect all dashboard mutations with `requireAdmin()`.
- Do not rely on middleware/proxy as the only auth layer.
- Dashboard must show apps, live endpoints, API keys, usage, and response samples from Convex.
- App and endpoint enable/disable actions must write to Convex and immediately affect public API traffic.
- Response samples must validate as JSON before they are stored.

## Convex Rules

- Local development runs Convex too.
- Convex HTTP actions must require `INTERNAL_API_SECRET`.
- Keep schema changes backward-compatible unless the user explicitly approves a breaking change.
- Add cleanup for expiring journey state when adding new ephemeral tables.
- Do not store user secrets or plaintext API keys.
- Convex owns runtime app registry state: `apiApps`, `apiEndpoints`, and `apiResponses`.

## Verification Checklist

- API auth rejects missing, invalid, and revoked keys.
- API happy paths return stable media URLs.
- Ephemeral journeys expire or clean up.
- Dashboard shows verticals, keys, usage, and empty states.
- Dashboard can enable/disable apps and endpoints.
- Disabled apps/endpoints block public API requests.
- Response samples can be added and removed from the dashboard.
- Passthrough APIs timeout and normalize failures.
- Typecheck, lint, tests, and builds pass or any blocker is clearly reported.
