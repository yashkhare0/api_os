import type { FastifyInstance } from "fastify";
import { realEstateBookingBodySchema, realEstatePropertiesQuerySchema } from "@dummy-api/contracts";
import type { PropertyListing } from "@dummy-api/catalog";
import type { AuthenticatedRequest } from "../../types";
import { parseIsoDate } from "../../lib/date";
import { badRequest, notFound } from "../../lib/http-error";
import { asNumber, asString, clampLimit } from "../../lib/query";
import type { VerticalContext } from "../../lib/vertical";

export async function registerRealEstateRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  app.get("/v1/real-estate/properties", { schema: { querystring: realEstatePropertiesQuerySchema } }, async (request) => {
    const query = request.query as Record<string, unknown>;
    const city = asString(query.city)?.toLowerCase();
    const propertyType = asString(query.propertyType);
    const minPrice = asNumber(query.minPrice);
    const maxPrice = asNumber(query.maxPrice);
    const minBedrooms = asNumber(query.minBedrooms);
    const minBathrooms = asNumber(query.minBathrooms);
    const limit = clampLimit(query.limit);

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw badRequest("minPrice cannot exceed maxPrice.");
    }

    const propertyListings = await context.store.listRealEstateProperties();
    const filtered = propertyListings
      .filter((listing) => !city || listing.city.toLowerCase() === city)
      .filter((listing) => !propertyType || listing.propertyType === propertyType)
      .filter((listing) => minPrice === undefined || listing.price >= minPrice)
      .filter((listing) => maxPrice === undefined || listing.price <= maxPrice)
      .filter((listing) => minBedrooms === undefined || listing.bedrooms >= minBedrooms)
      .filter((listing) => minBathrooms === undefined || listing.bathrooms >= minBathrooms)
      .slice(0, limit)
      .map(serializeProperty);

    return { data: filtered, meta: { count: filtered.length } };
  });

  app.get("/v1/real-estate/properties/:id", async (request) => {
    const { id } = request.params as { id: string };
    const listing = await context.store.getRealEstateProperty(id);

    if (!listing) {
      throw notFound("Property listing");
    }

    return { data: serializeProperty(listing) };
  });

  app.post("/v1/real-estate/bookings", { schema: { body: realEstateBookingBodySchema } }, async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const body = request.body as {
      propertyId: string;
      startDate: string;
      endDate: string;
      guestName?: string;
    };
    const property = await context.store.getRealEstateProperty(body.propertyId);

    if (!property) {
      throw badRequest("propertyId does not match an available property.");
    }

    const startDate = parseIsoDate(body.startDate, "startDate");
    const endDate = parseIsoDate(body.endDate, "endDate");
    if (Date.parse(startDate) >= Date.parse(endDate)) {
      throw badRequest("endDate must be after startDate.");
    }

    const booking = await context.store.createBooking({
      verticalSlug: "real-estate",
      apiKeyId: authRequest.auth.apiKeyId,
      itemId: property.id,
      startDate,
      endDate,
      ...(body.guestName ? { guestName: body.guestName } : {}),
      total: 0
    });

    return { data: booking };
  });
}

function serializeProperty(listing: PropertyListing) {
  return listing;
}
