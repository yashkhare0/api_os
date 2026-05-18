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
          src: `${baseUrl}/assets/cars/electra-northstar.jpg`,
          meta: "electric SUV"
        },
        {
          label: "Aster Vale",
          src: `${baseUrl}/assets/cars/aster-vale.jpg`,
          meta: "hybrid sedan"
        },
        {
          label: "Metro Pulse",
          src: `${baseUrl}/assets/cars/metro-pulse.jpg`,
          meta: "compact hatchback"
        }
      ],
      records: [
        {
          title: "Electra Northstar Touring AWD",
          description: "2026 electric SUV, 420 mile range, new condition.",
          meta: "$61,200 - Seattle",
          image: `${baseUrl}/assets/cars/electra-northstar.jpg`
        },
        {
          title: "Greenline Auto Seattle",
          description: "EV specialists with delivery and charger setup.",
          meta: "dealer_seattle_greenline",
          image: `${baseUrl}/assets/cars/electra-northstar.jpg`
        },
        {
          title: "Financing prequalification",
          description: "APR, amount financed, estimated payment, and review status.",
          meta: "Convex-backed TTL state",
          image: `${baseUrl}/assets/cars/aster-vale.jpg`
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
          src: `${baseUrl}/assets/ecommerce/electronics.jpg`,
          meta: "electronics"
        },
        {
          label: "Outdoor gear",
          src: `${baseUrl}/assets/ecommerce/outdoor.jpg`,
          meta: "outdoor"
        },
        {
          label: "Home goods",
          src: `${baseUrl}/assets/ecommerce/home.jpg`,
          meta: "home"
        }
      ],
      records: [
        {
          title: "Noise-canceling earbuds",
          description: "Adaptive noise cancellation with a 30-hour case.",
          meta: "$149 - prod_noise_canceling_earbuds_01",
          image: `${baseUrl}/assets/ecommerce/electronics.jpg`
        },
        {
          title: "Six-category catalog",
          description: "Apparel, home, electronics, wellness, outdoor, accessories.",
          meta: "GET /v1/ecommerce/categories",
          image: `${baseUrl}/assets/ecommerce/apparel.jpg`
        },
        {
          title: "Order confirmation",
          description: "Checkout creates a retrievable order while preserving cart totals.",
          meta: "Convex-backed order state",
          image: `${baseUrl}/assets/ecommerce/accessories.jpg`
        }
      ]
    };
  }

  if (appSlug === "real-estate") {
    return {
      eyebrow: "Residential real estate",
      title: "Property search, listing detail, viewing booking",
      summary:
        "A residential property API with searchable listings, generated real estate media, agent details, and Convex-backed viewing bookings.",
      journey: ["Search properties", "Review listing", "Inspect gallery", "Book viewing"],
      proof: [
        { label: "Listings", value: "3" },
        { label: "Markets", value: "3" },
        { label: "Media assets", value: "9" },
        { label: "State flows", value: "booking" }
      ],
      media: [
        {
          label: "Zilker bungalow",
          src: `${baseUrl}/assets/real-estate/zilker-bungalow.jpg`,
          meta: "Austin"
        },
        {
          label: "West Loop loft",
          src: `${baseUrl}/assets/real-estate/west-loop-loft-kitchen.png`,
          meta: "Chicago"
        },
        {
          label: "Highlands townhome",
          src: `${baseUrl}/assets/real-estate/highlands-townhome-rooftop.png`,
          meta: "Denver"
        }
      ],
      records: [
        {
          title: "Zilker modern bungalow",
          description: "Three-bedroom Austin house with garden, solar panels, and hosted gallery media.",
          meta: "$785,000 - property_austin_bungalow_01",
          image: `${baseUrl}/assets/real-estate/zilker-bungalow-living.png`
        },
        {
          title: "West Loop brick loft",
          description: "Industrial condo listing with agent details, HOA data, and city-view interiors.",
          meta: "$615,000 - property_chicago_loft_01",
          image: `${baseUrl}/assets/real-estate/west-loop-loft-bedroom.png`
        },
        {
          title: "Viewing booking",
          description: "POST a property and time window to create a confirmed viewing record.",
          meta: "Convex-backed TTL state",
          image: `${baseUrl}/assets/real-estate/highlands-townhome-kitchen.png`
        }
      ]
    };
  }

  return undefined;
}
