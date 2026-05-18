import type { FastifyInstance } from "fastify";
import {
  carAddItemBodySchema,
  carCheckoutBodySchema,
  carDealersQuerySchema,
  carFinancingPrequalificationBodySchema,
  carListingsQuerySchema
} from "@dummy-api/contracts";
import type { AuthenticatedRequest } from "../../types";
import { assetUrl } from "../../lib/assets";
import { badRequest, notFound } from "../../lib/http-error";
import { asNumber, asString, clampLimit } from "../../lib/query";
import type { VerticalContext } from "../../lib/vertical";
import { carDealers, carListings, type CarDealer, type CarListing } from "./data";

export async function registerCarRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  app.get("/v1/cars/listings", { schema: { querystring: carListingsQuerySchema } }, async (request) => {
    const query = request.query as Record<string, unknown>;
    const make = asString(query.make)?.toLowerCase();
    const model = asString(query.model)?.toLowerCase();
    const city = asString(query.city)?.toLowerCase();
    const bodyStyle = asString(query.bodyStyle);
    const fuelType = asString(query.fuelType);
    const condition = asString(query.condition);
    const minPrice = asNumber(query.minPrice);
    const maxPrice = asNumber(query.maxPrice);
    const maxMileage = asNumber(query.maxMileage);
    const limit = clampLimit(query.limit);

    const filtered = carListings
      .filter((listing) => !make || listing.make.toLowerCase() === make)
      .filter((listing) => !model || listing.model.toLowerCase() === model)
      .filter((listing) => !city || listing.city.toLowerCase() === city)
      .filter((listing) => !bodyStyle || listing.bodyStyle === bodyStyle)
      .filter((listing) => !fuelType || listing.fuelType === fuelType)
      .filter((listing) => !condition || listing.condition === condition)
      .filter((listing) => minPrice === undefined || listing.price >= minPrice)
      .filter((listing) => maxPrice === undefined || listing.price <= maxPrice)
      .filter((listing) => maxMileage === undefined || listing.mileage <= maxMileage)
      .slice(0, limit)
      .map((listing) => serializeCarListing(listing, context));

    return { data: filtered, meta: { count: filtered.length } };
  });

  app.get("/v1/cars/listings/:id", async (request) => {
    const { id } = request.params as { id: string };
    const listing = carListings.find((item) => item.id === id);

    if (!listing) {
      throw notFound("Car listing");
    }

    return { data: serializeCarListing(listing, context) };
  });

  app.get("/v1/cars/dealers", { schema: { querystring: carDealersQuerySchema } }, async (request) => {
    const query = request.query as Record<string, unknown>;
    const city = asString(query.city)?.toLowerCase();
    const state = asString(query.state)?.toLowerCase();
    const limit = clampLimit(query.limit);

    const filtered = carDealers
      .filter((dealer) => !city || dealer.city.toLowerCase() === city)
      .filter((dealer) => !state || dealer.state.toLowerCase() === state)
      .slice(0, limit)
      .map(serializeDealer);

    return { data: filtered, meta: { count: filtered.length } };
  });

  app.get("/v1/cars/dealers/:id", async (request) => {
    const { id } = request.params as { id: string };
    const dealer = carDealers.find((item) => item.id === id);

    if (!dealer) {
      throw notFound("Car dealer");
    }

    const inventoryCount = carListings.filter((listing) => listing.dealerId === dealer.id).length;
    return { data: { ...serializeDealer(dealer), inventoryCount } };
  });

  app.post("/v1/cars/carts", async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const cart = await context.store.createCart({
      verticalSlug: "cars",
      apiKeyId: authRequest.auth.apiKeyId
    });

    return { data: cart };
  });

  app.get("/v1/cars/carts/:cartId", async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const { cartId } = request.params as { cartId: string };
    const cart = await context.store.getCart(cartId, "cars", authRequest.auth.apiKeyId);

    if (!cart) {
      throw notFound("Cart");
    }

    return { data: cart };
  });

  app.post("/v1/cars/carts/:cartId/items", { schema: { body: carAddItemBodySchema } }, async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const { cartId } = request.params as { cartId: string };
    const body = request.body as { listingId: string; quantity?: number };
    const listing = carListings.find((item) => item.id === body.listingId);

    if (!listing) {
      throw badRequest("listingId does not match an available car listing.");
    }

    const cart = await context.store.addCartItem({
      cartId,
      verticalSlug: "cars",
      apiKeyId: authRequest.auth.apiKeyId,
      itemId: body.listingId,
      quantity: body.quantity ?? 1,
      unitPrice: listing.price
    });

    return { data: cart };
  });

  app.post("/v1/cars/checkouts", { schema: { body: carCheckoutBodySchema } }, async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const body = request.body as { cartId: string };
    const checkout = await context.store.checkoutCart({
      cartId: body.cartId,
      verticalSlug: "cars",
      apiKeyId: authRequest.auth.apiKeyId
    });

    return { data: checkout };
  });

  app.post(
    "/v1/cars/financing/prequalifications",
    { schema: { body: carFinancingPrequalificationBodySchema } },
    async (request) => {
      const authRequest = request as AuthenticatedRequest;
      const body = request.body as {
        listingId: string;
        applicantName?: string;
        annualIncome: number;
        downPayment: number;
        creditRating: "excellent" | "good" | "fair" | "building";
        termMonths: 36 | 48 | 60 | 72 | 84;
      };
      const listing = carListings.find((item) => item.id === body.listingId);

      if (!listing) {
        throw badRequest("listingId does not match an available car listing.");
      }

      if (body.downPayment > listing.price) {
        throw badRequest("downPayment cannot exceed the listing price.");
      }

      const estimate = calculateFinancingEstimate({
        price: listing.price,
        annualIncome: body.annualIncome,
        downPayment: body.downPayment,
        creditRating: body.creditRating,
        termMonths: body.termMonths
      });

      const prequalification = await context.store.createFinancingPrequalification({
        verticalSlug: "cars",
        apiKeyId: authRequest.auth.apiKeyId,
        listingId: listing.id,
        ...(body.applicantName ? { applicantName: body.applicantName } : {}),
        annualIncome: body.annualIncome,
        downPayment: body.downPayment,
        creditRating: body.creditRating,
        termMonths: body.termMonths,
        ...estimate
      });

      return { data: prequalification };
    }
  );

  app.get("/v1/cars/financing/prequalifications/:id", async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const prequalification = await context.store.getFinancingPrequalification({
      id,
      verticalSlug: "cars",
      apiKeyId: authRequest.auth.apiKeyId
    });

    if (!prequalification) {
      throw notFound("Financing prequalification");
    }

    return { data: prequalification };
  });
}

function serializeCarListing(listing: CarListing, context: VerticalContext) {
  const dealer = carDealers.find((item) => item.id === listing.dealerId);

  return {
    ...listing,
    ...(dealer ? { dealer: serializeDealer(dealer) } : {}),
    heroImage: assetUrl(context.config, listing.heroImage),
    gallery: listing.gallery.map((image) => assetUrl(context.config, image))
  };
}

function serializeDealer(dealer: CarDealer) {
  return dealer;
}

function calculateFinancingEstimate(input: {
  price: number;
  annualIncome: number;
  downPayment: number;
  creditRating: "excellent" | "good" | "fair" | "building";
  termMonths: number;
}) {
  const aprByRating = {
    excellent: 5.9,
    good: 7.4,
    fair: 10.9,
    building: 15.9
  } satisfies Record<typeof input.creditRating, number>;
  const apr = aprByRating[input.creditRating];
  const amountFinanced = Math.max(0, input.price - input.downPayment);
  const monthlyRate = apr / 100 / 12;
  const estimatedMonthlyPayment =
    monthlyRate === 0
      ? amountFinanced / input.termMonths
      : (amountFinanced * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -input.termMonths));
  const maxSuggestedPayment = input.annualIncome / 12 * 0.15;

  return {
    apr,
    amountFinanced,
    estimatedMonthlyPayment: Math.round(estimatedMonthlyPayment),
    status: estimatedMonthlyPayment <= maxSuggestedPayment ? "qualified" : "review_required"
  } as const;
}
