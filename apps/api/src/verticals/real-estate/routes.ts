import type { FastifyInstance } from "fastify";
import { realEstateBookingBodySchema, realEstatePropertiesQuerySchema } from "@dummy-api/contracts";
import type { AuthenticatedRequest } from "../../types";
import { assetUrl } from "../../lib/assets";
import { parseIsoDate } from "../../lib/date";
import { badRequest, notFound } from "../../lib/http-error";
import { asNumber, asString, clampLimit } from "../../lib/query";
import type { VerticalContext } from "../../lib/vertical";
import { propertyListings, type PropertyListing } from "./data";

export async function registerRealEstateRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  app.get("/v1/real-estate/properties", { schema: { querystring: realEstatePropertiesQuerySchema } }, async (request) => {
    const query = request.query as Record<string, unknown>;
    const city = asString(query.city)?.toLowerCase();
    const minPrice = asNumber(query.minPrice);
    const maxPrice = asNumber(query.maxPrice);
    const limit = clampLimit(query.limit);

    const filtered = propertyListings
      .filter((listing) => !city || listing.city.toLowerCase() === city)
      .filter((listing) => minPrice === undefined || listing.price >= minPrice)
      .filter((listing) => maxPrice === undefined || listing.price <= maxPrice)
      .slice(0, limit)
      .map((listing) => serializeProperty(listing, context));

    return { data: filtered, meta: { count: filtered.length } };
  });

  app.get("/v1/real-estate/properties/:id", async (request) => {
    const { id } = request.params as { id: string };
    const listing = propertyListings.find((item) => item.id === id);

    if (!listing) {
      throw notFound("Property listing");
    }

    return { data: serializeProperty(listing, context) };
  });

  app.post("/v1/real-estate/bookings", { schema: { body: realEstateBookingBodySchema } }, async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const body = request.body as {
      propertyId: string;
      startDate: string;
      endDate: string;
      guestName?: string;
    };
    const property = propertyListings.find((item) => item.id === body.propertyId);

    if (!property) {
      throw badRequest("propertyId does not match an available property.");
    }

    const booking = await context.store.createBooking({
      verticalSlug: "real-estate",
      apiKeyId: authRequest.auth.apiKeyId,
      itemId: property.id,
      startDate: parseIsoDate(body.startDate, "startDate"),
      endDate: parseIsoDate(body.endDate, "endDate"),
      ...(body.guestName ? { guestName: body.guestName } : {}),
      total: 0
    });

    return { data: booking };
  });
}

function serializeProperty(listing: PropertyListing, context: VerticalContext) {
  return {
    ...listing,
    heroImage: assetUrl(context.config, listing.heroImage),
    gallery: listing.gallery.map((image) => assetUrl(context.config, image))
  };
}
