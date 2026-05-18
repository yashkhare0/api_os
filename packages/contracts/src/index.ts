export type HttpMethod = "GET" | "POST";

export type JsonSchema = {
  readonly [key: string]: unknown;
};

export type ApiEndpointContract = {
  id: string;
  verticalSlug: string;
  method: HttpMethod;
  path: string;
  authRequired: true;
  querySchema?: JsonSchema;
  bodySchema?: JsonSchema;
};

export const carAddItemBodySchema = {
  type: "object",
  required: ["listingId"],
  properties: {
    listingId: { type: "string", minLength: 1 },
    quantity: { type: "integer", minimum: 1, maximum: 10, default: 1 }
  },
  additionalProperties: false
} as const;

export const carCheckoutBodySchema = {
  type: "object",
  required: ["cartId"],
  properties: {
    cartId: { type: "string", minLength: 1 }
  },
  additionalProperties: false
} as const;

export const carListingsQuerySchema = {
  type: "object",
  properties: {
    make: { type: "string", minLength: 1 },
    model: { type: "string", minLength: 1 },
    city: { type: "string", minLength: 1 },
    bodyStyle: {
      type: "string",
      enum: ["sedan", "suv", "truck", "coupe", "hatchback", "wagon", "van"]
    },
    fuelType: {
      type: "string",
      enum: ["gasoline", "hybrid", "plug-in-hybrid", "electric", "diesel"]
    },
    condition: {
      type: "string",
      enum: ["new", "used", "certified"]
    },
    minPrice: { type: "number", minimum: 0 },
    maxPrice: { type: "number", minimum: 0 },
    maxMileage: { type: "number", minimum: 0 },
    limit: { type: "integer", minimum: 1, maximum: 100 }
  },
  additionalProperties: false
} as const;

export const carDealersQuerySchema = {
  type: "object",
  properties: {
    city: { type: "string", minLength: 1 },
    state: { type: "string", minLength: 2, maxLength: 2 },
    limit: { type: "integer", minimum: 1, maximum: 100 }
  },
  additionalProperties: false
} as const;

export const carFinancingPrequalificationBodySchema = {
  type: "object",
  required: ["listingId", "annualIncome", "downPayment", "creditRating", "termMonths"],
  properties: {
    listingId: { type: "string", minLength: 1 },
    applicantName: { type: "string", minLength: 1, maxLength: 120 },
    annualIncome: { type: "number", minimum: 0 },
    downPayment: { type: "number", minimum: 0 },
    creditRating: {
      type: "string",
      enum: ["excellent", "good", "fair", "building"]
    },
    termMonths: {
      type: "integer",
      enum: [36, 48, 60, 72, 84]
    }
  },
  additionalProperties: false
} as const;

export const realEstatePropertiesQuerySchema = {
  type: "object",
  properties: {
    city: { type: "string", minLength: 1 },
    propertyType: {
      type: "string",
      enum: ["condo", "house", "townhouse"]
    },
    minPrice: { type: "number", minimum: 0 },
    maxPrice: { type: "number", minimum: 0 },
    minBedrooms: { type: "integer", minimum: 0 },
    minBathrooms: { type: "number", minimum: 0 },
    limit: { type: "integer", minimum: 1, maximum: 100 }
  },
  additionalProperties: false
} as const;

export const stayListingsQuerySchema = {
  type: "object",
  properties: {
    city: { type: "string", minLength: 1 },
    guests: { type: "integer", minimum: 1, maximum: 20 },
    maxNightlyRate: { type: "number", minimum: 0 },
    limit: { type: "integer", minimum: 1, maximum: 100 }
  },
  additionalProperties: false
} as const;

export const pokemonListQuerySchema = {
  type: "object",
  properties: {
    limit: { type: "integer", minimum: 1, maximum: 50 }
  },
  additionalProperties: false
} as const;

export const realEstateBookingBodySchema = {
  type: "object",
  required: ["propertyId", "startDate", "endDate"],
  properties: {
    propertyId: { type: "string", minLength: 1 },
    startDate: { type: "string", minLength: 1 },
    endDate: { type: "string", minLength: 1 },
    guestName: { type: "string", minLength: 1, maxLength: 120 }
  },
  additionalProperties: false
} as const;

export const stayReservationBodySchema = {
  type: "object",
  required: ["listingId", "startDate", "endDate", "guests"],
  properties: {
    listingId: { type: "string", minLength: 1 },
    startDate: { type: "string", minLength: 1 },
    endDate: { type: "string", minLength: 1 },
    guests: { type: "integer", minimum: 1, maximum: 20 },
    guestName: { type: "string", minLength: 1, maxLength: 120 }
  },
  additionalProperties: false
} as const;

export const ecommerceProductsQuerySchema = {
  type: "object",
  properties: {
    category: { type: "string", minLength: 1 },
    q: { type: "string", minLength: 1 },
    minPrice: { type: "number", minimum: 0 },
    maxPrice: { type: "number", minimum: 0 },
    color: { type: "string", minLength: 1 },
    inStock: { type: "boolean" },
    limit: { type: "integer", minimum: 1, maximum: 100 }
  },
  additionalProperties: false
} as const;

export const ecommerceAddItemBodySchema = {
  type: "object",
  required: ["productId"],
  properties: {
    productId: { type: "string", minLength: 1 },
    quantity: { type: "integer", minimum: 1, maximum: 25, default: 1 }
  },
  additionalProperties: false
} as const;

export const ecommerceCheckoutBodySchema = {
  type: "object",
  required: ["cartId"],
  properties: {
    cartId: { type: "string", minLength: 1 },
    customerEmail: { type: "string", minLength: 3, maxLength: 254 },
    shippingPostalCode: { type: "string", minLength: 3, maxLength: 20 }
  },
  additionalProperties: false
} as const;

export const endpointContracts = [
  {
    id: "cars.listings.list",
    verticalSlug: "cars",
    method: "GET",
    path: "/v1/cars/listings",
    authRequired: true,
    querySchema: carListingsQuerySchema
  },
  {
    id: "cars.listings.detail",
    verticalSlug: "cars",
    method: "GET",
    path: "/v1/cars/listings/:id",
    authRequired: true
  },
  {
    id: "cars.dealers.list",
    verticalSlug: "cars",
    method: "GET",
    path: "/v1/cars/dealers",
    authRequired: true,
    querySchema: carDealersQuerySchema
  },
  {
    id: "cars.dealers.detail",
    verticalSlug: "cars",
    method: "GET",
    path: "/v1/cars/dealers/:id",
    authRequired: true
  },
  {
    id: "cars.carts.create",
    verticalSlug: "cars",
    method: "POST",
    path: "/v1/cars/carts",
    authRequired: true
  },
  {
    id: "cars.carts.detail",
    verticalSlug: "cars",
    method: "GET",
    path: "/v1/cars/carts/:cartId",
    authRequired: true
  },
  {
    id: "cars.carts.items.add",
    verticalSlug: "cars",
    method: "POST",
    path: "/v1/cars/carts/:cartId/items",
    authRequired: true,
    bodySchema: carAddItemBodySchema
  },
  {
    id: "cars.checkouts.create",
    verticalSlug: "cars",
    method: "POST",
    path: "/v1/cars/checkouts",
    authRequired: true,
    bodySchema: carCheckoutBodySchema
  },
  {
    id: "cars.financing.prequalifications.create",
    verticalSlug: "cars",
    method: "POST",
    path: "/v1/cars/financing/prequalifications",
    authRequired: true,
    bodySchema: carFinancingPrequalificationBodySchema
  },
  {
    id: "cars.financing.prequalifications.detail",
    verticalSlug: "cars",
    method: "GET",
    path: "/v1/cars/financing/prequalifications/:id",
    authRequired: true
  },
  {
    id: "real-estate.properties.list",
    verticalSlug: "real-estate",
    method: "GET",
    path: "/v1/real-estate/properties",
    authRequired: true,
    querySchema: realEstatePropertiesQuerySchema
  },
  {
    id: "real-estate.properties.detail",
    verticalSlug: "real-estate",
    method: "GET",
    path: "/v1/real-estate/properties/:id",
    authRequired: true
  },
  {
    id: "real-estate.bookings.create",
    verticalSlug: "real-estate",
    method: "POST",
    path: "/v1/real-estate/bookings",
    authRequired: true,
    bodySchema: realEstateBookingBodySchema
  },
  {
    id: "stays.listings.list",
    verticalSlug: "stays",
    method: "GET",
    path: "/v1/stays/listings",
    authRequired: true,
    querySchema: stayListingsQuerySchema
  },
  {
    id: "stays.listings.detail",
    verticalSlug: "stays",
    method: "GET",
    path: "/v1/stays/listings/:id",
    authRequired: true
  },
  {
    id: "stays.reservations.create",
    verticalSlug: "stays",
    method: "POST",
    path: "/v1/stays/reservations",
    authRequired: true,
    bodySchema: stayReservationBodySchema
  },
  {
    id: "pokemon.pokemon.list",
    verticalSlug: "pokemon",
    method: "GET",
    path: "/v1/pokemon/pokemon",
    authRequired: true,
    querySchema: pokemonListQuerySchema
  },
  {
    id: "pokemon.pokemon.detail",
    verticalSlug: "pokemon",
    method: "GET",
    path: "/v1/pokemon/pokemon/:name",
    authRequired: true
  },
  {
    id: "ecommerce.categories.list",
    verticalSlug: "ecommerce",
    method: "GET",
    path: "/v1/ecommerce/categories",
    authRequired: true
  },
  {
    id: "ecommerce.products.list",
    verticalSlug: "ecommerce",
    method: "GET",
    path: "/v1/ecommerce/products",
    authRequired: true,
    querySchema: ecommerceProductsQuerySchema
  },
  {
    id: "ecommerce.products.detail",
    verticalSlug: "ecommerce",
    method: "GET",
    path: "/v1/ecommerce/products/:id",
    authRequired: true
  },
  {
    id: "ecommerce.carts.create",
    verticalSlug: "ecommerce",
    method: "POST",
    path: "/v1/ecommerce/carts",
    authRequired: true
  },
  {
    id: "ecommerce.carts.detail",
    verticalSlug: "ecommerce",
    method: "GET",
    path: "/v1/ecommerce/carts/:cartId",
    authRequired: true
  },
  {
    id: "ecommerce.carts.items.add",
    verticalSlug: "ecommerce",
    method: "POST",
    path: "/v1/ecommerce/carts/:cartId/items",
    authRequired: true,
    bodySchema: ecommerceAddItemBodySchema
  },
  {
    id: "ecommerce.checkouts.create",
    verticalSlug: "ecommerce",
    method: "POST",
    path: "/v1/ecommerce/checkouts",
    authRequired: true,
    bodySchema: ecommerceCheckoutBodySchema
  },
  {
    id: "ecommerce.orders.detail",
    verticalSlug: "ecommerce",
    method: "GET",
    path: "/v1/ecommerce/orders/:orderId",
    authRequired: true
  }
] as const satisfies readonly ApiEndpointContract[];

export function endpointSignature(contract: Pick<ApiEndpointContract, "method" | "path">): string {
  return `${contract.method} ${contract.path}`;
}

export function endpointsForVertical(verticalSlug: string): string[] {
  return endpointContracts
    .filter((contract) => contract.verticalSlug === verticalSlug)
    .map(endpointSignature);
}
