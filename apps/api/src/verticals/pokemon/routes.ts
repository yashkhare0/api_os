import type { FastifyInstance } from "fastify";
import { pokemonListQuerySchema } from "@dummy-api/contracts";
import { upstreamError } from "../../lib/http-error";
import { clampLimit } from "../../lib/query";
import type { VerticalContext } from "../../lib/vertical";

const ALLOWED_RESOURCES = new Set(["pokemon"]);
const UPSTREAM_TIMEOUT_MS = 4_000;

export async function registerPokemonRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  app.get("/v1/pokemon/pokemon", { schema: { querystring: pokemonListQuerySchema } }, async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const limit = clampLimit(query.limit, 20, 50);
    const data = await fetchAllowed(context, "pokemon", `?limit=${limit}`);
    reply.header("cache-control", "public, s-maxage=300, stale-while-revalidate=3600");
    return { data };
  });

  app.get("/v1/pokemon/pokemon/:name", async (request, reply) => {
    const { name } = request.params as { name: string };
    const safeName = encodeURIComponent(name.toLowerCase());
    const data = await fetchAllowed(context, "pokemon", `/${safeName}`);
    reply.header("cache-control", "public, s-maxage=300, stale-while-revalidate=3600");
    return { data };
  });
}

async function fetchAllowed(context: VerticalContext, resource: string, suffix: string): Promise<unknown> {
  if (!ALLOWED_RESOURCES.has(resource)) {
    throw upstreamError("Requested upstream resource is not allowed.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(`${context.config.pokeApiBaseUrl}/${resource}${suffix}`, {
      signal: controller.signal,
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw upstreamError("PokeAPI returned an unsuccessful response.", {
        statusCode: response.status
      });
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw upstreamError("PokeAPI request timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
