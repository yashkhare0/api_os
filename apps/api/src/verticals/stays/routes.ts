import type { FastifyInstance } from "fastify";
import { stayListingsQuerySchema, stayReservationBodySchema } from "@dummy-api/contracts";
import type { StayListing } from "@dummy-api/catalog";
import type { AuthenticatedRequest } from "../../types";
import { parseIsoDate } from "../../lib/date";
import { badRequest, notFound } from "../../lib/http-error";
import { asNumber, asString, clampLimit } from "../../lib/query";
import type { VerticalContext } from "../../lib/vertical";

export async function registerStayRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  app.get("/v1/stays/listings", { schema: { querystring: stayListingsQuerySchema } }, async (request) => {
    const query = request.query as Record<string, unknown>;
    const city = asString(query.city)?.toLowerCase();
    const guests = asNumber(query.guests);
    const maxNightlyRate = asNumber(query.maxNightlyRate);
    const limit = clampLimit(query.limit);
    const stayListings = await context.store.listStayListings();

    const filtered = stayListings
      .filter((listing) => !city || listing.city.toLowerCase() === city)
      .filter((listing) => guests === undefined || listing.maxGuests >= guests)
      .filter((listing) => maxNightlyRate === undefined || listing.nightlyRate <= maxNightlyRate)
      .slice(0, limit)
      .map(serializeStay);

    return { data: filtered, meta: { count: filtered.length } };
  });

  app.get("/v1/stays/listings/:id", async (request) => {
    const { id } = request.params as { id: string };
    const listing = await context.store.getStayListing(id);

    if (!listing) {
      throw notFound("Stay listing");
    }

    return { data: serializeStay(listing) };
  });

  app.post("/v1/stays/reservations", { schema: { body: stayReservationBodySchema } }, async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const body = request.body as {
      listingId: string;
      startDate: string;
      endDate: string;
      guests: number;
      guestName?: string;
    };
    const listing = await context.store.getStayListing(body.listingId);

    if (!listing) {
      throw badRequest("listingId does not match an available stay.");
    }

    if (body.guests > listing.maxGuests) {
      throw badRequest("guests exceeds this stay's maxGuests.");
    }

    const startDate = parseIsoDate(body.startDate, "startDate");
    const endDate = parseIsoDate(body.endDate, "endDate");
    const nights = Math.max(1, Math.ceil((Date.parse(endDate) - Date.parse(startDate)) / 86_400_000));

    const reservation = await context.store.createBooking({
      verticalSlug: "stays",
      apiKeyId: authRequest.auth.apiKeyId,
      itemId: listing.id,
      startDate,
      endDate,
      ...(body.guestName ? { guestName: body.guestName } : {}),
      total: listing.nightlyRate * nights
    });

    return { data: reservation };
  });
}

function serializeStay(listing: StayListing) {
  return listing;
}
