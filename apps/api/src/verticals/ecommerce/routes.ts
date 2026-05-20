import type { FastifyInstance } from "fastify";
import {
  ecommerceAddItemBodySchema,
  ecommerceCheckoutBodySchema,
  ecommerceProductsQuerySchema
} from "@dummy-api/contracts";
import type { Product, ProductCategory } from "@dummy-api/catalog";
import type { AuthenticatedRequest } from "../../types";
import { badRequest, notFound } from "../../lib/http-error";
import { asBoolean, asNumber, asString, clampLimit } from "../../lib/query";
import type { VerticalContext } from "../../lib/vertical";

export async function registerEcommerceRoutes(app: FastifyInstance, context: VerticalContext): Promise<void> {
  app.get("/v1/ecommerce/categories", async () => {
    const categories = await context.store.listEcommerceCategories();

    return {
      data: categories,
      meta: { count: categories.length }
    };
  });

  app.get("/v1/ecommerce/products", { schema: { querystring: ecommerceProductsQuerySchema } }, async (request) => {
    const query = request.query as Record<string, unknown>;
    const category = asString(query.category)?.toLowerCase();
    const search = asString(query.q)?.toLowerCase();
    const minPrice = asNumber(query.minPrice);
    const maxPrice = asNumber(query.maxPrice);
    const color = asString(query.color)?.toLowerCase();
    const inStock = asBoolean(query.inStock);
    const limit = clampLimit(query.limit);
    const [products, productCategories] = await Promise.all([
      context.store.listEcommerceProducts(),
      context.store.listEcommerceCategories()
    ]);

    const filtered = products
      .filter((product) => {
        if (!category) {
          return true;
        }

        const productCategory = categoryForProduct(product, productCategories);
        return product.categoryId.toLowerCase() === category || productCategory?.slug.toLowerCase() === category;
      })
      .filter((product) => {
        if (!search) {
          return true;
        }

        const haystack = [product.name, product.description, ...product.tags].join(" ").toLowerCase();
        return haystack.includes(search);
      })
      .filter((product) => minPrice === undefined || product.price >= minPrice)
      .filter((product) => maxPrice === undefined || product.price <= maxPrice)
      .filter((product) => !color || product.colors.some((item) => item.toLowerCase() === color))
      .filter((product) => inStock === undefined || (inStock ? product.stock > 0 : product.stock === 0))
      .slice(0, limit)
      .map((product) => serializeProduct(product, productCategories));

    return { data: filtered, meta: { count: filtered.length } };
  });

  app.get("/v1/ecommerce/products/:id", async (request) => {
    const { id } = request.params as { id: string };
    const [product, productCategories] = await Promise.all([
      context.store.getEcommerceProduct(id),
      context.store.listEcommerceCategories()
    ]);

    if (!product) {
      throw notFound("Product");
    }

    return { data: serializeProduct(product, productCategories) };
  });

  app.post("/v1/ecommerce/carts", async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const cart = await context.store.createCart({
      verticalSlug: "ecommerce",
      apiKeyId: authRequest.auth.apiKeyId
    });

    return { data: cart };
  });

  app.get("/v1/ecommerce/carts/:cartId", async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const { cartId } = request.params as { cartId: string };
    const cart = await context.store.getCart(cartId, "ecommerce", authRequest.auth.apiKeyId);

    if (!cart) {
      throw notFound("Cart");
    }

    return { data: cart };
  });

  app.post(
    "/v1/ecommerce/carts/:cartId/items",
    { schema: { body: ecommerceAddItemBodySchema } },
    async (request) => {
      const authRequest = request as AuthenticatedRequest;
      const { cartId } = request.params as { cartId: string };
      const body = request.body as { productId: string; quantity?: number };
      const product = await context.store.getEcommerceProduct(body.productId);
      const quantity = body.quantity ?? 1;

      if (!product) {
        throw badRequest("productId does not match an available product.");
      }

      if (product.stock < quantity) {
        throw badRequest("quantity exceeds available product stock.");
      }

      const cart = await context.store.addCartItem({
        cartId,
        verticalSlug: "ecommerce",
        apiKeyId: authRequest.auth.apiKeyId,
        itemId: body.productId,
        quantity,
        unitPrice: product.price
      });

      return { data: cart };
    }
  );

  app.post("/v1/ecommerce/checkouts", { schema: { body: ecommerceCheckoutBodySchema } }, async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const body = request.body as {
      cartId: string;
      customerEmail?: string;
      shippingPostalCode?: string;
    };
    const cart = await context.store.getCart(body.cartId, "ecommerce", authRequest.auth.apiKeyId);

    if (!cart) {
      throw notFound("Cart");
    }

    if (cart.items.length === 0) {
      throw badRequest("Cart must contain at least one item before checkout.");
    }

    const products = await context.store.listEcommerceProducts();
    for (const item of cart.items) {
      const product = products.find((candidate) => candidate.id === item.itemId);
      if (!product) {
        throw badRequest(`Cart item ${item.itemId} is no longer available.`);
      }

      if (product.stock < item.quantity) {
        throw badRequest(`Cart item ${item.itemId} exceeds available product stock.`);
      }
    }

    const checkout = await context.store.checkoutCart({
      cartId: body.cartId,
      verticalSlug: "ecommerce",
      apiKeyId: authRequest.auth.apiKeyId
    });
    const order = await context.store.createOrder({
      verticalSlug: "ecommerce",
      apiKeyId: authRequest.auth.apiKeyId,
      checkoutId: checkout.id,
      items: cart.items,
      subtotal: checkout.total,
      total: checkout.total,
      ...(body.customerEmail ? { customerEmail: body.customerEmail } : {}),
      ...(body.shippingPostalCode ? { shippingPostalCode: body.shippingPostalCode } : {})
    });

    return { data: { checkout, order } };
  });

  app.get("/v1/ecommerce/orders/:orderId", async (request) => {
    const authRequest = request as AuthenticatedRequest;
    const { orderId } = request.params as { orderId: string };
    const order = await context.store.getOrder(orderId, "ecommerce", authRequest.auth.apiKeyId);

    if (!order) {
      throw notFound("Order");
    }

    return { data: order };
  });
}

function serializeProduct(product: Product, productCategories: ProductCategory[]) {
  return {
    ...product,
    category: categoryForProduct(product, productCategories)
  };
}

function categoryForProduct(product: Product, productCategories: ProductCategory[]) {
  return productCategories.find((category) => category.id === product.categoryId);
}
