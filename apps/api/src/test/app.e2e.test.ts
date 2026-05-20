import type { FastifyInstance } from "fastify";
import { catalogSeed, mediaAssetSeeds, verticals, type CatalogSeed } from "@dummy-api/catalog";
import { endpointContracts } from "@dummy-api/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import type { ApiConfig } from "../lib/config";
import { startConvexHttpHarness, type ConvexHttpHarness } from "./convex-http-harness";
import { startPokeApiHarness, type PokeApiHarness } from "./pokeapi-harness";

const apiKey = "dak_test_key_for_e2e";
const internalSecret = "internal-secret-for-e2e";

describe("public API end to end", () => {
  let app: FastifyInstance;
  let convex: ConvexHttpHarness;
  let pokeApi: PokeApiHarness;

  beforeAll(async () => {
    convex = await startConvexHttpHarness({ apiKey, internalSecret });
    pokeApi = await startPokeApiHarness();

    const config: ApiConfig = {
      apiBaseUrl: "http://api.test",
      convexHttpUrl: convex.url,
      internalApiSecret: internalSecret,
      corsOrigin: "*",
      pokeApiBaseUrl: pokeApi.url,
      port: 0
    };

    app = await buildApp({ config, logger: false });
  });

  afterAll(async () => {
    await app.close();
    await convex.close();
    await pokeApi.close();
  });

  it("rejects requests without an API key", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/cars/listings"
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: "unauthorized" }
    });
  });

  it("lists cars with stable hosted media URLs and records usage through Convex HTTP", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/cars/listings?make=Electra&bodyStyle=suv&fuelType=electric&maxMileage=500",
      headers: { "x-api-key": apiKey }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      id: "car_electra_suv_01",
      dealer: { id: "dealer_seattle_greenline" },
      heroImage: "http://blob.test/blobs/assets/cars/electra-northstar.jpg"
    });
    expect(body.data[0].gallery).toHaveLength(2);
    await waitFor(() =>
      convex.state.usageEvents.some(
        (event) =>
          event.apiKeyId === "test-api-key" &&
          event.verticalSlug === "cars" &&
          event.method === "GET" &&
          event.statusCode === 200
      )
    );
  });

  it("lists dealers and creates retrievable car financing prequalifications", async () => {
    const dealersResponse = await app.inject({
      method: "GET",
      url: "/v1/cars/dealers?state=WA",
      headers: { "x-api-key": apiKey }
    });

    expect(dealersResponse.statusCode).toBe(200);
    expect(dealersResponse.json()).toMatchObject({
      data: [{ id: "dealer_seattle_greenline", city: "Seattle" }],
      meta: { count: 1 }
    });

    const financingResponse = await app.inject({
      method: "POST",
      url: "/v1/cars/financing/prequalifications",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        listingId: "car_electra_suv_01",
        applicantName: "Jordan Driver",
        annualIncome: 145000,
        downPayment: 12000,
        creditRating: "excellent",
        termMonths: 60
      }
    });

    expect(financingResponse.statusCode).toBe(200);
    const prequalification = financingResponse.json().data as { id: string };
    expect(financingResponse.json().data).toMatchObject({
      verticalSlug: "cars",
      listingId: "car_electra_suv_01",
      amountFinanced: 49200,
      status: "qualified"
    });

    const detailResponse = await app.inject({
      method: "GET",
      url: `/v1/cars/financing/prequalifications/${prequalification.id}`,
      headers: { "x-api-key": apiKey }
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().data).toMatchObject({
      id: prequalification.id,
      applicantName: "Jordan Driver"
    });
  });

  it("rejects car financing for unknown listings", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/cars/financing/prequalifications",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        listingId: "missing",
        annualIncome: 90000,
        downPayment: 4000,
        creditRating: "good",
        termMonths: 72
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: "bad_request" }
    });
  });

  it("completes the cars cart and checkout journey through Convex HTTP", async () => {
    const cartResponse = await app.inject({
      method: "POST",
      url: "/v1/cars/carts",
      headers: { "x-api-key": apiKey }
    });
    const cart = cartResponse.json().data as { id: string };

    const itemResponse = await app.inject({
      method: "POST",
      url: `/v1/cars/carts/${cart.id}/items`,
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        listingId: "car_electra_suv_01",
        quantity: 1
      }
    });
    expect(itemResponse.statusCode).toBe(200);
    expect(itemResponse.json().data.items).toHaveLength(1);

    const checkoutResponse = await app.inject({
      method: "POST",
      url: "/v1/cars/checkouts",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: { cartId: cart.id }
    });

    expect(checkoutResponse.statusCode).toBe(200);
    expect(checkoutResponse.json().data).toMatchObject({
      verticalSlug: "cars",
      total: 61200,
      status: "confirmed"
    });
  });

  it("completes the ecommerce product cart, checkout, and order journey", async () => {
    const categoriesResponse = await app.inject({
      method: "GET",
      url: "/v1/ecommerce/categories",
      headers: { "x-api-key": apiKey }
    });
    expect(categoriesResponse.statusCode).toBe(200);
    expect(categoriesResponse.json().data).toHaveLength(6);

    const productsResponse = await app.inject({
      method: "GET",
      url: "/v1/ecommerce/products?category=electronics&q=wireless&limit=5",
      headers: { "x-api-key": apiKey }
    });
    expect(productsResponse.statusCode).toBe(200);
    expect(productsResponse.json().data[0]).toMatchObject({
      id: "prod_noise_canceling_earbuds_01",
      heroImage: "http://blob.test/blobs/assets/ecommerce/electronics.jpg"
    });

    const cartResponse = await app.inject({
      method: "POST",
      url: "/v1/ecommerce/carts",
      headers: { "x-api-key": apiKey }
    });
    const cart = cartResponse.json().data as { id: string };

    const addResponse = await app.inject({
      method: "POST",
      url: `/v1/ecommerce/carts/${cart.id}/items`,
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        productId: "prod_noise_canceling_earbuds_01",
        quantity: 2
      }
    });
    expect(addResponse.statusCode).toBe(200);
    expect(addResponse.json().data.items).toHaveLength(1);

    const checkoutResponse = await app.inject({
      method: "POST",
      url: "/v1/ecommerce/checkouts",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        cartId: cart.id,
        customerEmail: "buyer@example.test",
        shippingPostalCode: "98101"
      }
    });

    expect(checkoutResponse.statusCode).toBe(200);
    const order = checkoutResponse.json().data.order as { id: string };
    expect(checkoutResponse.json().data.order).toMatchObject({
      verticalSlug: "ecommerce",
      checkoutId: checkoutResponse.json().data.checkout.id,
      total: 298,
      customerEmail: "buyer@example.test"
    });

    const orderResponse = await app.inject({
      method: "GET",
      url: `/v1/ecommerce/orders/${order.id}`,
      headers: { "x-api-key": apiKey }
    });
    expect(orderResponse.statusCode).toBe(200);
    expect(orderResponse.json().data).toMatchObject({
      id: order.id,
      status: "confirmed"
    });
  });

  it("rejects DB-backed journey mutations for missing inventory and over-capacity stays", async () => {
    const cartResponse = await app.inject({
      method: "POST",
      url: "/v1/ecommerce/carts",
      headers: { "x-api-key": apiKey }
    });
    const cart = cartResponse.json().data as { id: string };

    const missingProductResponse = await app.inject({
      method: "POST",
      url: `/v1/ecommerce/carts/${cart.id}/items`,
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        productId: "missing",
        quantity: 1
      }
    });
    expect(missingProductResponse.statusCode).toBe(400);
    expect(missingProductResponse.json()).toMatchObject({
      error: { code: "bad_request" }
    });

    const oversoldProductResponse = await app.inject({
      method: "POST",
      url: `/v1/ecommerce/carts/${cart.id}/items`,
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        productId: "prod_portable_mini_projector_01",
        quantity: 12
      }
    });
    expect(oversoldProductResponse.statusCode).toBe(400);
    expect(oversoldProductResponse.json()).toMatchObject({
      error: { code: "bad_request" }
    });

    const overCapacityStayResponse = await app.inject({
      method: "POST",
      url: "/v1/stays/reservations",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        listingId: "stay_sedona_casita_01",
        startDate: "2026-06-01T16:00:00.000Z",
        endDate: "2026-06-03T10:00:00.000Z",
        guests: 5
      }
    });
    expect(overCapacityStayResponse.statusCode).toBe(400);
    expect(overCapacityStayResponse.json()).toMatchObject({
      error: { code: "bad_request" }
    });
  });

  it("completes booking journeys for real estate and stays", async () => {
    const propertiesResponse = await app.inject({
      method: "GET",
      url: "/v1/real-estate/properties?city=Austin",
      headers: { "x-api-key": apiKey }
    });
    expect(propertiesResponse.statusCode).toBe(200);
    expect(propertiesResponse.json().data[0]).toMatchObject({
      id: "property_austin_bungalow_01",
      heroImage: "http://blob.test/blobs/assets/real-estate/zilker-bungalow.jpg"
    });
    expect(propertiesResponse.json().data[0].gallery).toEqual([
      "http://blob.test/blobs/assets/real-estate/zilker-bungalow.jpg",
      "http://blob.test/blobs/assets/real-estate/zilker-bungalow-living.png",
      "http://blob.test/blobs/assets/real-estate/zilker-bungalow-yard.png"
    ]);

    const listingsResponse = await app.inject({
      method: "GET",
      url: "/v1/stays/listings?city=Sedona",
      headers: { "x-api-key": apiKey }
    });
    expect(listingsResponse.statusCode).toBe(200);
    expect(listingsResponse.json().data[0]).toMatchObject({
      id: "stay_sedona_casita_01",
      heroImage: "http://blob.test/blobs/assets/stays/sedona-casita.jpg"
    });

    const realEstateResponse = await app.inject({
      method: "POST",
      url: "/v1/real-estate/bookings",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        propertyId: "property_austin_bungalow_01",
        startDate: "2026-06-01T10:00:00.000Z",
        endDate: "2026-06-01T10:30:00.000Z",
        guestName: "Alex Buyer"
      }
    });
    expect(realEstateResponse.statusCode).toBe(200);
    expect(realEstateResponse.json().data).toMatchObject({
      verticalSlug: "real-estate",
      itemId: "property_austin_bungalow_01"
    });

    const stayResponse = await app.inject({
      method: "POST",
      url: "/v1/stays/reservations",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        listingId: "stay_sedona_casita_01",
        startDate: "2026-06-01T16:00:00.000Z",
        endDate: "2026-06-03T10:00:00.000Z",
        guests: 2
      }
    });
    expect(stayResponse.statusCode).toBe(200);
    expect(stayResponse.json().data).toMatchObject({
      verticalSlug: "stays",
      itemId: "stay_sedona_casita_01",
      total: 440
    });
  });

  it("filters and fetches real estate listings with hosted gallery media", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/real-estate/properties?propertyType=townhouse&minBedrooms=4&minBathrooms=2.5&limit=1",
      headers: { "x-api-key": apiKey }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: [
        {
          id: "property_denver_townhome_01",
          city: "Denver",
          propertyType: "townhouse",
          listingAgent: {
            brokerage: "Front Range Collective"
          }
        }
      ],
      meta: { count: 1 }
    });
    expect(response.json().data[0].gallery).toContain(
      "http://blob.test/blobs/assets/real-estate/highlands-townhome-rooftop.png"
    );

    const detailResponse = await app.inject({
      method: "GET",
      url: "/v1/real-estate/properties/property_chicago_loft_01",
      headers: { "x-api-key": apiKey }
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().data).toMatchObject({
      id: "property_chicago_loft_01",
      neighborhood: "West Loop",
      coordinates: { latitude: 41.8864, longitude: -87.6491 }
    });
    expect(detailResponse.json().data.gallery).toEqual([
      "http://blob.test/blobs/assets/real-estate/west-loop-loft.jpg",
      "http://blob.test/blobs/assets/real-estate/west-loop-loft-kitchen.png",
      "http://blob.test/blobs/assets/real-estate/west-loop-loft-bedroom.png"
    ]);

    const assetResponse = await app.inject({
      method: "GET",
      url: "/assets/real-estate/west-loop-loft-kitchen.png"
    });
    expect(assetResponse.statusCode).toBe(200);
    expect(assetResponse.headers["content-type"]).toContain("image/png");
  });

  it("serves vertical catalog changes synced through the Convex registry boundary", async () => {
    const mutatedCatalog: CatalogSeed = {
      carDealers: catalogSeed.carDealers.map((dealer) =>
        dealer.id === "dealer_seattle_greenline" ? { ...dealer, name: "DB Seed Motors", city: "Tacoma" } : dealer
      ),
      carListings: catalogSeed.carListings.map((listing) =>
        listing.id === "car_electra_suv_01" ? { ...listing, price: 64001, mileage: 321 } : listing
      ),
      ecommerceCategories: catalogSeed.ecommerceCategories,
      ecommerceProducts: catalogSeed.ecommerceProducts.map((product) =>
        product.id === "prod_noise_canceling_earbuds_01"
          ? { ...product, name: "DB-backed earbuds", price: 177, stock: 7 }
          : product
      ),
      realEstateProperties: catalogSeed.realEstateProperties.map((property) =>
        property.id === "property_austin_bungalow_01"
          ? { ...property, price: 786123, neighborhood: "Synced District" }
          : property
      ),
      stayListings: catalogSeed.stayListings.map((listing) =>
        listing.id === "stay_sedona_casita_01" ? { ...listing, nightlyRate: 333, maxGuests: 3 } : listing
      )
    };

    try {
      await syncRegistry(convex, mutatedCatalog);

      const carResponse = await app.inject({
        method: "GET",
        url: "/v1/cars/listings/car_electra_suv_01",
        headers: { "x-api-key": apiKey }
      });
      expect(carResponse.statusCode).toBe(200);
      expect(carResponse.json().data).toMatchObject({
        id: "car_electra_suv_01",
        price: 64001,
        mileage: 321,
        dealer: {
          name: "DB Seed Motors",
          city: "Tacoma"
        }
      });

      const productResponse = await app.inject({
        method: "GET",
        url: "/v1/ecommerce/products/prod_noise_canceling_earbuds_01",
        headers: { "x-api-key": apiKey }
      });
      expect(productResponse.statusCode).toBe(200);
      expect(productResponse.json().data).toMatchObject({
        id: "prod_noise_canceling_earbuds_01",
        name: "DB-backed earbuds",
        price: 177,
        stock: 7,
        category: { slug: "electronics" }
      });

      const propertyResponse = await app.inject({
        method: "GET",
        url: "/v1/real-estate/properties/property_austin_bungalow_01",
        headers: { "x-api-key": apiKey }
      });
      expect(propertyResponse.statusCode).toBe(200);
      expect(propertyResponse.json().data).toMatchObject({
        id: "property_austin_bungalow_01",
        price: 786123,
        neighborhood: "Synced District"
      });

      const stayResponse = await app.inject({
        method: "GET",
        url: "/v1/stays/listings/stay_sedona_casita_01",
        headers: { "x-api-key": apiKey }
      });
      expect(stayResponse.statusCode).toBe(200);
      expect(stayResponse.json().data).toMatchObject({
        id: "stay_sedona_casita_01",
        nightlyRate: 333,
        maxGuests: 3
      });
    } finally {
      await syncRegistry(convex);
    }
  });

  it("rejects invalid real estate requests", async () => {
    const missingDetailResponse = await app.inject({
      method: "GET",
      url: "/v1/real-estate/properties/missing",
      headers: { "x-api-key": apiKey }
    });
    expect(missingDetailResponse.statusCode).toBe(404);
    expect(missingDetailResponse.json()).toMatchObject({
      error: { code: "not_found" }
    });

    const invalidRangeResponse = await app.inject({
      method: "GET",
      url: "/v1/real-estate/properties?minPrice=900000&maxPrice=100000",
      headers: { "x-api-key": apiKey }
    });
    expect(invalidRangeResponse.statusCode).toBe(400);
    expect(invalidRangeResponse.json()).toMatchObject({
      error: { code: "bad_request" }
    });

    const invalidBookingResponse = await app.inject({
      method: "POST",
      url: "/v1/real-estate/bookings",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        propertyId: "property_austin_bungalow_01",
        startDate: "2026-06-01T11:00:00.000Z",
        endDate: "2026-06-01T10:30:00.000Z"
      }
    });
    expect(invalidBookingResponse.statusCode).toBe(400);
    expect(invalidBookingResponse.json()).toMatchObject({
      error: { code: "bad_request" }
    });
  });

  it("enforces vertical request contracts", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/stays/reservations",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      payload: {
        listingId: "stay_malibu_canyon_01",
        startDate: "2026-06-01T16:00:00.000Z",
        endDate: "2026-06-03T10:00:00.000Z",
        guests: 5,
        unexpected: true
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: "bad_request" }
    });
  });

  it("passes through the allowlisted Pokemon list API with safe pagination", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/pokemon/pokemon?limit=1&offset=1",
      headers: { "x-api-key": apiKey }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        count: 2,
        results: [{ name: "ivysaur" }]
      }
    });
    expect(response.headers["cache-control"]).toBe("public, s-maxage=300, stale-while-revalidate=3600");
  });

  it("passes through the allowlisted Pokemon detail API", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/pokemon/pokemon/bulbasaur",
      headers: { "x-api-key": apiKey }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        id: 1,
        name: "bulbasaur"
      }
    });
    expect(response.headers["cache-control"]).toBe("public, s-maxage=300, stale-while-revalidate=3600");
  });

  it("passes through additional PokeAPI resources exposed in OpenAPI", async () => {
    const abilityListResponse = await app.inject({
      method: "GET",
      url: "/v1/pokemon/ability?limit=1",
      headers: { "x-api-key": apiKey }
    });
    expect(abilityListResponse.statusCode).toBe(200);
    expect(abilityListResponse.json()).toMatchObject({
      data: {
        results: [{ name: "stench" }]
      }
    });

    const abilityDetailResponse = await app.inject({
      method: "GET",
      url: "/v1/pokemon/ability/stench",
      headers: { "x-api-key": apiKey }
    });
    expect(abilityDetailResponse.statusCode).toBe(200);
    expect(abilityDetailResponse.json()).toMatchObject({
      data: {
        id: 1,
        name: "stench"
      }
    });

    const encountersResponse = await app.inject({
      method: "GET",
      url: "/v1/pokemon/pokemon/bulbasaur/encounters",
      headers: { "x-api-key": apiKey }
    });
    expect(encountersResponse.statusCode).toBe(200);
    expect(encountersResponse.json()).toMatchObject({
      data: [{ location_area: { name: "cerulean-city-area" } }]
    });

    const metaResponse = await app.inject({
      method: "GET",
      url: "/v1/pokemon/meta",
      headers: { "x-api-key": apiKey }
    });
    expect(metaResponse.statusCode).toBe(200);
    expect(metaResponse.json()).toMatchObject({
      data: {
        hash: "test-pokeapi-harness"
      }
    });
  });

  it("validates Pokemon passthrough path parameters", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/pokemon/pokemon/bulbasaur!",
      headers: { "x-api-key": apiKey }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: "validation_error" }
    });
  });

  it("normalizes Pokemon upstream failures", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/pokemon/pokemon/missingno",
      headers: { "x-api-key": apiKey }
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      error: {
        code: "upstream_error",
        details: { upstreamStatusCode: 404 }
      }
    });
  });

  it("blocks disabled endpoints from the platform registry", async () => {
    await fetch(`${convex.url}/admin/registry/endpoints/status`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${internalSecret}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        method: "GET",
        path: "/v1/cars/listings/:id",
        status: "disabled"
      })
    });

    const disabledResponse = await app.inject({
      method: "GET",
      url: "/v1/cars/listings/car_aster_sedan_01",
      headers: { "x-api-key": apiKey }
    });
    expect(disabledResponse.statusCode).toBe(503);
    expect(disabledResponse.json()).toMatchObject({
      error: { code: "endpoint_disabled" }
    });

    await fetch(`${convex.url}/admin/registry/endpoints/status`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${internalSecret}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        method: "GET",
        path: "/v1/cars/listings/:id",
        status: "active"
      })
    });
  });
});

async function waitFor(assertion: () => boolean): Promise<void> {
  const deadline = Date.now() + 500;
  while (Date.now() < deadline) {
    if (assertion()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  expect(assertion()).toBe(true);
}

async function syncRegistry(convex: ConvexHttpHarness, catalog: CatalogSeed = catalogSeed): Promise<void> {
  const response = await fetch(`${convex.url}/admin/registry/sync`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${internalSecret}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      apps: verticals.map((vertical) => ({
        slug: vertical.slug,
        name: vertical.name,
        description: vertical.description,
        journey: vertical.journey,
        media: vertical.media
      })),
      endpoints: endpointContracts.map((contract) => ({
        contractId: contract.id,
        appSlug: contract.verticalSlug,
        method: contract.method,
        path: contract.path
      })),
      mediaAssets: mediaAssetSeeds,
      catalog
    })
  });

  expect(response.status).toBe(200);
}
