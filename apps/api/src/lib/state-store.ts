import { type CartRecord, type UsageEvent } from "@dummy-api/core";
import type {
  CarDealer,
  CarListing,
  Product,
  ProductCategory,
  PropertyListing,
  StayListing
} from "@dummy-api/catalog";
import type {
  ApiAuthContext,
  BookingRecord,
  CheckoutRecord,
  EcommerceOrderRecord,
  FinancingPrequalificationRecord,
  OrderItemRecord
} from "../types";
import type { ApiConfig } from "./config";
import { HttpError } from "./http-error";

export type ValidateApiKeyInput = {
  keyHash: string;
  prefix: string;
};

export type CreateCartInput = {
  verticalSlug: string;
  apiKeyId: string;
};

export type AddCartItemInput = {
  cartId: string;
  verticalSlug: string;
  apiKeyId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
};

export type CheckoutCartInput = {
  cartId: string;
  verticalSlug: string;
  apiKeyId: string;
};

export type GetCheckoutInput = {
  checkoutId: string;
  verticalSlug: string;
  apiKeyId: string;
};

export type CreateFinancingPrequalificationInput = {
  verticalSlug: string;
  apiKeyId: string;
  listingId: string;
  applicantName?: string;
  annualIncome: number;
  downPayment: number;
  creditRating: "excellent" | "good" | "fair" | "building";
  termMonths: number;
  apr: number;
  amountFinanced: number;
  estimatedMonthlyPayment: number;
  status: "qualified" | "review_required";
};

export type GetFinancingPrequalificationInput = {
  id: string;
  verticalSlug: string;
  apiKeyId: string;
};

export type CreateBookingInput = {
  verticalSlug: string;
  apiKeyId: string;
  itemId: string;
  startDate: string;
  endDate: string;
  guestName?: string;
  total: number;
};

export type CreateOrderInput = {
  verticalSlug: string;
  apiKeyId: string;
  checkoutId: string;
  items: OrderItemRecord[];
  subtotal: number;
  total: number;
  customerEmail?: string;
  shippingPostalCode?: string;
};

export type StateStore = {
  validateApiKey(input: ValidateApiKeyInput): Promise<ApiAuthContext | null>;
  resolveEndpoint(input: { method: string; path: string }): Promise<{ live: boolean }>;
  recordUsage(event: UsageEvent): Promise<void>;
  listCarDealers(): Promise<CarDealer[]>;
  getCarDealer(id: string): Promise<CarDealer | null>;
  listCarListings(): Promise<CarListing[]>;
  getCarListing(id: string): Promise<CarListing | null>;
  listEcommerceCategories(): Promise<ProductCategory[]>;
  listEcommerceProducts(): Promise<Product[]>;
  getEcommerceProduct(id: string): Promise<Product | null>;
  listRealEstateProperties(): Promise<PropertyListing[]>;
  getRealEstateProperty(id: string): Promise<PropertyListing | null>;
  listStayListings(): Promise<StayListing[]>;
  getStayListing(id: string): Promise<StayListing | null>;
  createCart(input: CreateCartInput): Promise<CartRecord>;
  getCart(cartId: string, verticalSlug: string, apiKeyId: string): Promise<CartRecord | null>;
  addCartItem(input: AddCartItemInput): Promise<CartRecord>;
  checkoutCart(input: CheckoutCartInput): Promise<CheckoutRecord>;
  getCheckout(input: GetCheckoutInput): Promise<CheckoutRecord | null>;
  createBooking(input: CreateBookingInput): Promise<BookingRecord>;
  createFinancingPrequalification(
    input: CreateFinancingPrequalificationInput
  ): Promise<FinancingPrequalificationRecord>;
  getFinancingPrequalification(
    input: GetFinancingPrequalificationInput
  ): Promise<FinancingPrequalificationRecord | null>;
  createOrder(input: CreateOrderInput): Promise<EcommerceOrderRecord>;
  getOrder(orderId: string, verticalSlug: string, apiKeyId: string): Promise<EcommerceOrderRecord | null>;
};

export function getStateStore(config: ApiConfig): StateStore {
  return new ConvexHttpStateStore(config);
}

class ConvexHttpStateStore implements StateStore {
  constructor(private readonly config: ApiConfig) {}

  async validateApiKey(input: ValidateApiKeyInput): Promise<ApiAuthContext | null> {
    return this.post<ApiAuthContext | null>("/auth/validate-key", input, true);
  }

  async resolveEndpoint(input: { method: string; path: string }): Promise<{ live: boolean }> {
    return this.post<{ live: boolean }>("/registry/resolve", input, true);
  }

  async recordUsage(event: UsageEvent): Promise<void> {
    await this.post<void>("/usage/record", event, true);
  }

  async listCarDealers(): Promise<CarDealer[]> {
    return this.listCatalog<CarDealer>("carDealers");
  }

  async getCarDealer(id: string): Promise<CarDealer | null> {
    return this.getCatalog<CarDealer>("carDealers", id);
  }

  async listCarListings(): Promise<CarListing[]> {
    return this.listCatalog<CarListing>("carListings");
  }

  async getCarListing(id: string): Promise<CarListing | null> {
    return this.getCatalog<CarListing>("carListings", id);
  }

  async listEcommerceCategories(): Promise<ProductCategory[]> {
    return this.listCatalog<ProductCategory>("ecommerceCategories");
  }

  async listEcommerceProducts(): Promise<Product[]> {
    return this.listCatalog<Product>("ecommerceProducts");
  }

  async getEcommerceProduct(id: string): Promise<Product | null> {
    return this.getCatalog<Product>("ecommerceProducts", id);
  }

  async listRealEstateProperties(): Promise<PropertyListing[]> {
    return this.listCatalog<PropertyListing>("realEstateProperties");
  }

  async getRealEstateProperty(id: string): Promise<PropertyListing | null> {
    return this.getCatalog<PropertyListing>("realEstateProperties", id);
  }

  async listStayListings(): Promise<StayListing[]> {
    return this.listCatalog<StayListing>("stayListings");
  }

  async getStayListing(id: string): Promise<StayListing | null> {
    return this.getCatalog<StayListing>("stayListings", id);
  }

  async createCart(input: CreateCartInput): Promise<CartRecord> {
    return this.post<CartRecord>("/journeys/carts", input, true);
  }

  async getCart(cartId: string, verticalSlug: string, apiKeyId: string): Promise<CartRecord | null> {
    return this.post<CartRecord | null>("/journeys/carts/get", { cartId, verticalSlug, apiKeyId }, true);
  }

  async addCartItem(input: AddCartItemInput): Promise<CartRecord> {
    return this.post<CartRecord>("/journeys/carts/items", input, true);
  }

  async checkoutCart(input: CheckoutCartInput): Promise<CheckoutRecord> {
    return this.post<CheckoutRecord>("/journeys/checkouts", input, true);
  }

  async getCheckout(input: GetCheckoutInput): Promise<CheckoutRecord | null> {
    return this.post<CheckoutRecord | null>("/journeys/checkouts/get", input, true);
  }

  async createBooking(input: CreateBookingInput): Promise<BookingRecord> {
    return this.post<BookingRecord>("/journeys/bookings", input, true);
  }

  async createFinancingPrequalification(
    input: CreateFinancingPrequalificationInput
  ): Promise<FinancingPrequalificationRecord> {
    return this.post<FinancingPrequalificationRecord>("/journeys/financing-prequalifications", input, true);
  }

  async getFinancingPrequalification(
    input: GetFinancingPrequalificationInput
  ): Promise<FinancingPrequalificationRecord | null> {
    return this.post<FinancingPrequalificationRecord | null>("/journeys/financing-prequalifications/get", input, true);
  }

  async createOrder(input: CreateOrderInput): Promise<EcommerceOrderRecord> {
    return this.post<EcommerceOrderRecord>("/journeys/orders", input, true);
  }

  async getOrder(orderId: string, verticalSlug: string, apiKeyId: string): Promise<EcommerceOrderRecord | null> {
    return this.post<EcommerceOrderRecord | null>("/journeys/orders/get", { orderId, verticalSlug, apiKeyId }, true);
  }

  private async listCatalog<T>(collection: string): Promise<T[]> {
    return this.post<T[]>("/catalog/list", { collection }, true);
  }

  private async getCatalog<T>(collection: string, externalId: string): Promise<T | null> {
    return this.post<T | null>("/catalog/get", { collection, externalId }, true);
  }

  private async post<T>(path: string, body: unknown, internal: boolean): Promise<T> {
    if (!this.config.convexHttpUrl) {
      throw new Error("CONVEX_HTTP_URL is not configured.");
    }

    const response = await fetch(`${this.config.convexHttpUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(internal && this.config.internalApiSecret
          ? { authorization: `Bearer ${this.config.internalApiSecret}` }
          : {})
      },
      body: JSON.stringify(body)
    });

    const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;
    if (!response.ok) {
      throw new HttpError(
        response.status,
        response.status === 404 ? "not_found" : response.status === 400 ? "bad_request" : "state_store_error",
        payload?.error ?? `Convex request failed with ${response.status}`
      );
    }

    return payload?.data as T;
  }
}
