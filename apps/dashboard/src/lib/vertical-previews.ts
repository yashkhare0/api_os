export type VerticalPreview = {
  eyebrow: string;
  title: string;
  summary: string;
  journey: string[];
  proof: Array<{ label: string; value: string }>;
  media: Array<{ label: string; src: string; meta: string }>;
  records: Array<{ title: string; description: string; meta: string; image: string }>;
};

export function getVerticalPreview(appSlug: string, apiBaseUrl: string): VerticalPreview | undefined {
  const baseUrl = apiBaseUrl.replace(/\/+$/, "");

  if (appSlug === "cars") {
    return {
      eyebrow: "Automotive retail",
      title: "Inventory, dealer, financing, cart, checkout",
      summary:
        "A richer vehicle API with fictional makes, real-feeling dealer locations, generated catalog media, and a finance lead flow.",
      journey: ["Search inventory", "Inspect dealer", "Prequalify financing", "Cart vehicle", "Confirm checkout"],
      proof: [
        { label: "Listings", value: "20" },
        { label: "Dealers", value: "6" },
        { label: "Media assets", value: "60+" },
        { label: "State flows", value: "cart + finance" }
      ],
      media: [
        {
          label: "Electra Northstar",
          src: `${baseUrl}/assets/cars/electra-northstar-hero.svg`,
          meta: "electric SUV"
        },
        {
          label: "Velo Aria",
          src: `${baseUrl}/assets/cars/velo-aria-hero.svg`,
          meta: "manual coupe"
        },
        {
          label: "Aurora Trail",
          src: `${baseUrl}/assets/cars/aurora-trail-hero.svg`,
          meta: "long-range SUV"
        }
      ],
      records: [
        {
          title: "Electra Northstar Touring AWD",
          description: "2026 electric SUV, 420 mile range, new condition.",
          meta: "$61,200 - Seattle",
          image: `${baseUrl}/assets/cars/electra-northstar-hero.svg`
        },
        {
          title: "Greenline Auto Seattle",
          description: "EV specialists with delivery and charger setup.",
          meta: "dealer_seattle_greenline",
          image: `${baseUrl}/assets/cars/halo-city-hero.svg`
        },
        {
          title: "Financing prequalification",
          description: "APR, amount financed, estimated payment, and review status.",
          meta: "Convex-backed TTL state",
          image: `${baseUrl}/assets/cars/zenith-crest-interior.svg`
        }
      ]
    };
  }

  if (appSlug === "ecommerce") {
    return {
      eyebrow: "General lifestyle retail",
      title: "Products, categories, carts, checkout, orders",
      summary:
        "A broad retail API with searchable product catalog, generated product media, stock-aware carts, and order confirmation.",
      journey: ["Browse categories", "Filter products", "Create cart", "Add items", "Checkout", "Retrieve order"],
      proof: [
        { label: "Products", value: "30" },
        { label: "Categories", value: "6" },
        { label: "Media assets", value: "90" },
        { label: "State flows", value: "cart + order" }
      ],
      media: [
        {
          label: "Wireless earbuds",
          src: `${baseUrl}/assets/ecommerce/noise-canceling-earbuds-hero.svg`,
          meta: "electronics"
        },
        {
          label: "Trail daypack",
          src: `${baseUrl}/assets/ecommerce/trail-daypack-hero.svg`,
          meta: "outdoor"
        },
        {
          label: "Ceramic lamp",
          src: `${baseUrl}/assets/ecommerce/ceramic-table-lamp-hero.svg`,
          meta: "home"
        }
      ],
      records: [
        {
          title: "Noise-canceling earbuds",
          description: "Adaptive noise cancellation with a 30-hour case.",
          meta: "$149 - prod_noise_canceling_earbuds_01",
          image: `${baseUrl}/assets/ecommerce/noise-canceling-earbuds-hero.svg`
        },
        {
          title: "Six-category catalog",
          description: "Apparel, home, electronics, wellness, outdoor, accessories.",
          meta: "GET /v1/ecommerce/categories",
          image: `${baseUrl}/assets/ecommerce/linen-overshirt-hero.svg`
        },
        {
          title: "Order confirmation",
          description: "Checkout creates a retrievable order while preserving cart totals.",
          meta: "Convex-backed order state",
          image: `${baseUrl}/assets/ecommerce/tech-organizer-pouch-hero.svg`
        }
      ]
    };
  }

  return undefined;
}
