import { describe, expect, it } from "vitest";
import { endpointContracts, endpointSignature, pokeApiPassthroughResources } from "@dummy-api/contracts";
import { verticals } from "@dummy-api/catalog";
import { buildApp } from "../app";
import type { ApiConfig } from "../lib/config";
import { startConvexHttpHarness } from "./convex-http-harness";
import { startPokeApiHarness } from "./pokeapi-harness";

describe("API contracts", () => {
  it("keeps catalog endpoint metadata in sync with route contracts", () => {
    for (const vertical of verticals) {
      const expected = endpointContracts
        .filter((contract) => contract.verticalSlug === vertical.slug)
        .map(endpointSignature)
        .sort();

      expect([...vertical.endpoints].sort()).toEqual(expected);
    }
  });

  it("marks every public v1 contract as API-key protected", () => {
    expect(endpointContracts).not.toHaveLength(0);
    expect(endpointContracts.every((contract) => contract.path.startsWith("/v1/"))).toBe(true);
    expect(endpointContracts.every((contract) => contract.authRequired)).toBe(true);
  });

  it("exposes the PokeAPI passthrough allowlist as first-class contracts", () => {
    const pokemonContracts = endpointContracts.filter((contract) => contract.verticalSlug === "pokemon");
    const paginatedResources = pokeApiPassthroughResources.filter((resource) => resource !== "meta");

    expect(pokemonContracts).toHaveLength(paginatedResources.length * 2 + 2);
    expect(pokemonContracts.map(endpointSignature)).toContain("GET /v1/pokemon/ability");
    expect(pokemonContracts.map(endpointSignature)).toContain("GET /v1/pokemon/ability/:idOrName");
    expect(pokemonContracts.map(endpointSignature)).toContain("GET /v1/pokemon/pokemon/:name/encounters");
    expect(pokemonContracts.map(endpointSignature)).toContain("GET /v1/pokemon/meta");
  });

  it("registers every contracted route in Fastify", async () => {
    const apiKey = "dak_contract_route_key";
    const internalSecret = "contract-secret";
    const convex = await startConvexHttpHarness({ apiKey, internalSecret });
    const pokeApi = await startPokeApiHarness();
    const config: ApiConfig = {
      apiBaseUrl: "http://api.test",
      convexHttpUrl: convex.url,
      internalApiSecret: internalSecret,
      corsOrigin: "*",
      pokeApiBaseUrl: pokeApi.url,
      port: 0
    };
    const app = await buildApp({ config, logger: false });

    try {
      for (const contract of endpointContracts) {
        expect(app.hasRoute({ method: contract.method, url: contract.path })).toBe(true);
      }
    } finally {
      await app.close();
      await convex.close();
      await pokeApi.close();
    }
  });
});
