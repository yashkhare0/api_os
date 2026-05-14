import type { FastifyInstance } from "fastify";
import { verticals } from "@dummy-api/catalog";
import type { VerticalContext } from "../lib/vertical";
import { registerCarRoutes } from "./cars/routes";
import { registerEcommerceRoutes } from "./ecommerce/routes";
import { registerPokemonRoutes } from "./pokemon/routes";
import { registerRealEstateRoutes } from "./real-estate/routes";
import { registerStayRoutes } from "./stays/routes";

export async function registerVerticalRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  app.get("/v1", async () => ({
    data: verticals,
    meta: { count: verticals.length }
  }));

  await registerCarRoutes(app, context);
  await registerEcommerceRoutes(app, context);
  await registerRealEstateRoutes(app, context);
  await registerStayRoutes(app, context);
  await registerPokemonRoutes(app, context);
}
