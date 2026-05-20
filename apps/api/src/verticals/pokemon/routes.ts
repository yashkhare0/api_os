import type { FastifyInstance } from "fastify";
import {
  pokeApiPassthroughResources,
  pokemonEncountersParamsSchema,
  pokemonIdOrNameParamsSchema,
  pokemonListQuerySchema,
  pokemonNameParamsSchema,
  type PokeApiPassthroughResource
} from "@dummy-api/contracts";
import { badRequest } from "../../lib/http-error";
import { fetchAllowedUpstreamJson, type AllowedUpstreamRequest } from "../../lib/passthrough";
import { asNumber, clampLimit } from "../../lib/query";
import type { VerticalContext } from "../../lib/vertical";

const ALLOWED_RESOURCES = new Set<string>(pokeApiPassthroughResources);
const POKEAPI_NAME = "PokeAPI";
const UPSTREAM_TIMEOUT_MS = 4_000;

export async function registerPokemonRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  for (const resource of pokeApiPassthroughResources) {
    if (resource === "meta") {
      app.get("/v1/pokemon/meta", async (_request, reply) => {
        const data = await fetchPokemonResource(context, resource);
        reply.header("cache-control", "public, s-maxage=300, stale-while-revalidate=3600");
        return { data };
      });
      continue;
    }

    app.get(`/v1/pokemon/${resource}`, { schema: { querystring: pokemonListQuerySchema } }, async (request, reply) => {
      const data = await fetchPokemonResource(context, resource, { query: listQuery(request.query) });
      reply.header("cache-control", "public, s-maxage=300, stale-while-revalidate=3600");
      return { data };
    });

    const detailParamName = resource === "pokemon" ? "name" : "idOrName";
    const detailParamsSchema = resource === "pokemon" ? pokemonNameParamsSchema : pokemonIdOrNameParamsSchema;
    app.get(
      `/v1/pokemon/${resource}/:${detailParamName}`,
      { schema: { params: detailParamsSchema } },
      async (request, reply) => {
        const params = request.params as Record<string, string>;
        const idOrName = params[detailParamName];
        if (!idOrName) {
          throw badRequest("A PokeAPI resource identifier is required.");
        }

        const data = await fetchPokemonResource(context, resource, { pathSegments: [idOrName.toLowerCase()] });
        reply.header("cache-control", "public, s-maxage=300, stale-while-revalidate=3600");
        return { data };
      }
    );
  }

  app.get("/v1/pokemon/pokemon/:name/encounters", { schema: { params: pokemonEncountersParamsSchema } }, async (request, reply) => {
    const { name } = request.params as { name: string };
    const data = await fetchPokemonResource(context, "pokemon", { pathSegments: [name.toLowerCase(), "encounters"] });
    reply.header("cache-control", "public, s-maxage=300, stale-while-revalidate=3600");
    return { data };
  });
}

function listQuery(query: unknown): URLSearchParams {
  const input = query as Record<string, unknown>;
  const limit = clampLimit(input.limit, 20, 50);
  const offset = Math.trunc(asNumber(input.offset) ?? 0);

  return new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });
}

async function fetchPokemonResource(
  context: VerticalContext,
  resource: PokeApiPassthroughResource,
  input: { pathSegments?: string[]; query?: URLSearchParams } = {}
): Promise<unknown> {
  const request: AllowedUpstreamRequest = {
    upstreamName: POKEAPI_NAME,
    baseUrl: context.config.pokeApiBaseUrl,
    allowedResources: ALLOWED_RESOURCES,
    resource,
    timeoutMs: UPSTREAM_TIMEOUT_MS
  };

  if (input.pathSegments) {
    request.pathSegments = input.pathSegments;
  }

  if (input.query) {
    request.query = input.query;
  }

  return fetchAllowedUpstreamJson(request);
}
