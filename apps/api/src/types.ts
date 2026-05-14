import type { FastifyRequest } from "fastify";

export type ApiAuthContext = {
  apiKeyId: string;
  apiKeyPrefix: string;
  name: string;
};

export type AuthenticatedRequest = FastifyRequest & {
  auth: ApiAuthContext;
  requestStartedAt: number;
};

export type CheckoutRecord = {
  id: string;
  verticalSlug: string;
  apiKeyId: string;
  cartId?: string;
  bookingId?: string;
  total: number;
  status: "confirmed";
  createdAt: number;
};

export type BookingRecord = {
  id: string;
  verticalSlug: string;
  apiKeyId: string;
  itemId: string;
  startDate: string;
  endDate: string;
  guestName?: string;
  total: number;
  status: "confirmed";
  expiresAt: number;
  createdAt: number;
};

export type FinancingPrequalificationStatus = "qualified" | "review_required";

export type FinancingPrequalificationRecord = {
  id: string;
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
  status: FinancingPrequalificationStatus;
  expiresAt: number;
  createdAt: number;
};

export type OrderItemRecord = {
  itemId: string;
  quantity: number;
  unitPrice: number;
};

export type EcommerceOrderRecord = {
  id: string;
  verticalSlug: string;
  apiKeyId: string;
  checkoutId: string;
  items: OrderItemRecord[];
  subtotal: number;
  total: number;
  customerEmail?: string;
  shippingPostalCode?: string;
  status: "confirmed";
  createdAt: number;
};
