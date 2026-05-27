# API STORE

API STORE is DRIO's production-grade TypeScript scaffold for vertical dummy APIs, with Fastify public APIs, a Next.js admin dashboard, and Convex-backed runtime state.

## Structure

- `apps/api`: Fastify vertical API module used by the dashboard app and API tests.
- `apps/dashboard`: Single deployable Next.js app. It serves the dashboard plus `/v1/*`, `/assets/*`, and `/health/*`.
- `convex`: Convex schema, HTTP actions, state mutations, queries, and cleanup cron.
- `packages/contracts`: Endpoint signatures and request schemas used by the API, dashboard, and tests.
- `packages/catalog`: Shared vertical registry consumed by the API and dashboard.
- `packages/core`: Shared API-key, usage, and journey types/helpers.

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy env values:

   ```bash
   cp .env.example .env.local
   ```

3. Start Convex locally:

   ```bash
   pnpm convex:dev
   ```

4. Put the local Convex HTTP URL into `CONVEX_HTTP_URL` and use the same `INTERNAL_API_SECRET` for the API, dashboard, and Convex env.
   The workspace dev scripts load this file from the repo root, so keep these values in `./.env.local`.

5. Start the app:

   ```bash
   pnpm dev
   ```

6. Open the app at `http://localhost:9998`, create an API key from the dashboard, then call the public API on the same origin:

   ```bash
   curl http://localhost:9998/v1/cars/listings -H "x-api-key: dak_..."
   ```

## Public API

- `GET /health/live`
- `GET /health/ready`
- `GET /v1`
- `GET /v1/cars/listings`
- `GET /v1/cars/listings/:id`
- `GET /v1/cars/dealers`
- `GET /v1/cars/dealers/:id`
- `POST /v1/cars/carts`
- `POST /v1/cars/carts/:cartId/items`
- `GET /v1/cars/carts/:cartId`
- `POST /v1/cars/checkouts`
- `POST /v1/cars/financing/prequalifications`
- `GET /v1/cars/financing/prequalifications/:id`
- `GET /v1/ecommerce/categories`
- `GET /v1/ecommerce/products`
- `GET /v1/ecommerce/products/:id`
- `POST /v1/ecommerce/carts`
- `POST /v1/ecommerce/carts/:cartId/items`
- `GET /v1/ecommerce/carts/:cartId`
- `POST /v1/ecommerce/checkouts`
- `GET /v1/ecommerce/orders/:orderId`
- `GET /v1/real-estate/properties`
- `GET /v1/real-estate/properties/:id`
- `POST /v1/real-estate/bookings`
- `GET /v1/stays/listings`
- `GET /v1/stays/listings/:id`
- `POST /v1/stays/reservations`
- `GET /v1/pokemon/pokemon`
- `GET /v1/pokemon/pokemon/:name`

All `/v1` routes require `x-api-key` or `Authorization: Bearer <key>`.

Apps and endpoints are live only when registered as `active` in Convex. The dashboard syncs code-defined contracts into Convex and can disable an entire app or a single endpoint. Disabled endpoints return:

```json
{
  "error": {
    "code": "endpoint_disabled",
    "message": "This API endpoint is disabled."
  }
}
```

## API Operations Dashboard

The dashboard is an operations console for APIs:

- View registered apps/API sets.
- See which endpoints are live or disabled.
- Enable or disable apps and individual endpoints.
- Add and remove JSON response samples for endpoints.
- Create and revoke API keys.
- Inspect usage by app.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Deployment

Deploy the repository root as one Vercel project. Do not create separate Vercel projects for `apps/api` and `apps/dashboard`; the root `vercel.json` builds `@dummy-api/dashboard`, which embeds the Fastify API module so `/dashboard/*`, `/v1/*`, `/assets/*`, and `/health/*` are served from one origin.

Use these Vercel project settings:

- Root Directory: `.` (repository root — leave blank in the UI)
- Framework Preset: Next.js
- Install Command: leave empty to use root `vercel.json`
- Build Command: leave empty to use root `vercel.json`
- Output Directory: leave empty to use root `vercel.json` (`.next` after sync)

Root `vercel.json` builds `@dummy-api/dashboard`, then copies `apps/dashboard/.next` into the Vercel project root as `.next`. That avoids failures when the dashboard app lives in a subdirectory.

Do not set Root Directory to `apps/api`. If it is set to `apps/api`, Vercel looks for output at paths like `apps/api/apps/dashboard/.next` when Output Directory is overridden to `apps/dashboard/.next`.

The project needs:

- `CONVEX_HTTP_URL`
- `INTERNAL_API_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `API_PUBLIC_BASE_URL`
- `CORS_ORIGIN`
- `POKEAPI_BASE_URL`

## License

MIT. See [LICENSE](./LICENSE).
