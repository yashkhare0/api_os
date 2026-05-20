export type Faq = {
  question: string;
  answer: string;
};

export type ApiUseCase = {
  slug: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  audience: string;
  prototype: string;
  heroImage: string;
  accent: string;
  outcome: string;
  bestFor: string[];
  workflow: string[];
  aiSummary: string;
  faq: Faq[];
};

export type BlogSection = {
  heading: string;
  body: string[];
  bullets?: string[];
  code?: string;
  cta?: {
    label: string;
    href: string;
  };
};

export type BlogPost = {
  title: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  category: "product" | "technology" | "company";
  contentType: "guide" | "tutorial" | "thought-leadership" | "deep-dive";
  appSlug?: string;
  excerpt: string;
  tldr: string;
  seo: {
    metaDescription: string;
    focusKeyword: string;
    secondaryKeywords: string[];
    faq: Faq[];
  };
  sections: BlogSection[];
};

export const siteConfig = {
  name: "API Store",
  tagline: "Production-grade dummy APIs for UI prototypes",
  description:
    "API Store gives designers, frontend teams, and AI coding agents stable authenticated APIs with realistic data, media, and journey state.",
  updatedAt: "2026-05-18",
  defaultApiKey: "dak_your_key"
} as const;

export const apiUseCases: Record<string, ApiUseCase> = {
  cars: {
    slug: "cars",
    eyebrow: "Automotive API",
    title: "Build car marketplace prototypes with inventory, dealers, carts, and financing.",
    metaTitle: "Car API for UI Prototypes | API Store",
    metaDescription:
      "Use the Cars API to prototype automotive inventory search, dealer pages, vehicle carts, checkout, and financing prequalification with stable data.",
    summary:
      "The Cars API gives prototype teams a full automotive retail journey: searchable vehicle inventory, dealer lookup, cart state, checkout, and financing prequalification.",
    audience: "Frontend teams designing car marketplaces, EV retail experiences, finance flows, and dealer portals.",
    prototype:
      "A user can search inventory, open a listing, review dealer context, add the vehicle to a cart, submit a prequalification, and complete a dummy checkout.",
    heroImage: "/assets/cars/electra-northstar.jpg",
    accent: "bg-emerald-500",
    outcome: "A high-fidelity automotive UI can use one API surface instead of local fixtures.",
    bestFor: ["Vehicle search", "Dealer pages", "Finance lead capture", "Cart and checkout"],
    workflow: [
      "Search `/v1/cars/listings` with make, body style, fuel type, condition, and price filters.",
      "Open `/v1/cars/listings/:id` and `/v1/cars/dealers/:id` for detail screens.",
      "Create a cart, add a vehicle, and submit checkout with Convex-backed state.",
      "Create and retrieve financing prequalification records for loan estimate prototypes."
    ],
    aiSummary:
      "Use the Cars API when an AI assistant or frontend team needs automotive inventory, dealer, cart, checkout, and financing data for a realistic vehicle retail prototype.",
    faq: [
      {
        question: "What can I prototype with the Cars API?",
        answer:
          "You can prototype search results, vehicle detail pages, dealer profiles, cart flows, dummy checkout, and financing prequalification without creating local mock data."
      },
      {
        question: "Does the Cars API include media?",
        answer:
          "Yes. Vehicle responses include stable platform-served vehicle images so prototype cards, galleries, and detail pages can render real visual states."
      },
      {
        question: "Does the Cars API require authentication?",
        answer:
          "Yes. Every public `/v1` endpoint requires an API key through the `x-api-key` header, matching the platform security contract."
      }
    ]
  },
  ecommerce: {
    slug: "ecommerce",
    eyebrow: "Ecommerce API",
    title: "Prototype retail catalogs, carts, checkout, and order confirmation without seed scripts.",
    metaTitle: "Ecommerce API for UI Prototypes | API Store",
    metaDescription:
      "Use the Ecommerce API for product catalog, categories, carts, checkout, and dummy order confirmation in frontend mockups and demos.",
    summary:
      "The Ecommerce API covers the retail journey from category browsing to order retrieval, with searchable products, inventory-aware cart state, and hosted product media.",
    audience: "Teams building storefronts, product discovery pages, checkout experiments, and post-purchase screens.",
    prototype:
      "A shopper can browse categories, search products, inspect detail pages, create a cart, add items, submit checkout, and retrieve the created order.",
    heroImage: "/assets/ecommerce/electronics.jpg",
    accent: "bg-amber-500",
    outcome: "Retail prototypes can move directly from static screens to data-backed flows.",
    bestFor: ["Product grids", "Category pages", "Cart state", "Checkout and orders"],
    workflow: [
      "Load categories from `/v1/ecommerce/categories`.",
      "Search `/v1/ecommerce/products` by category, query, price, color, stock, and limit.",
      "Open `/v1/ecommerce/products/:id` for PDP layouts and image galleries.",
      "Create carts, add items, submit checkout, and retrieve orders for complete commerce flows."
    ],
    aiSummary:
      "Use the Ecommerce API for product catalog, category browsing, carts, checkout, and order confirmation in retail UI prototypes.",
    faq: [
      {
        question: "Can the Ecommerce API power a full checkout prototype?",
        answer:
          "Yes. It supports cart creation, item additions, checkout creation, and order retrieval, so frontend teams can model the full purchase path."
      },
      {
        question: "Are product images stable?",
        answer:
          "Yes. Product and category media are served by the platform under `/assets/ecommerce/*`, which keeps UI screenshots and demos repeatable."
      },
      {
        question: "Can I filter products?",
        answer:
          "Yes. Product list requests support category, search query, price range, color, stock, and limit filters."
      }
    ]
  },
  "real-estate": {
    slug: "real-estate",
    eyebrow: "Real estate API",
    title: "Create property search and viewing-booking prototypes from real-feeling listing data.",
    metaTitle: "Real Estate API for UI Prototypes | API Store",
    metaDescription:
      "Use the Real Estate API to prototype property search, listing detail, media galleries, agent context, and viewing booking flows.",
    summary:
      "The Real Estate API provides residential property search, listing detail, image galleries, agent context, and viewing-booking state for marketplace prototypes.",
    audience: "Teams designing brokerage portals, property marketplaces, relocation tools, and lead capture flows.",
    prototype:
      "A buyer can search properties, inspect price and listing detail, review media, choose a viewing window, and receive a dummy booking response.",
    heroImage: "/assets/real-estate/zilker-bungalow.jpg",
    accent: "bg-sky-500",
    outcome: "Property UIs can show believable listing data and booking outcomes immediately.",
    bestFor: ["Property search", "Listing galleries", "Agent cards", "Viewing booking"],
    workflow: [
      "Search `/v1/real-estate/properties` by city, type, price, bedrooms, bathrooms, and limit.",
      "Render listing detail from `/v1/real-estate/properties/:id`.",
      "Use hosted gallery media for exterior, interior, and lifestyle states.",
      "Create viewing bookings with `/v1/real-estate/bookings`."
    ],
    aiSummary:
      "Use the Real Estate API for property search, listing detail, hosted listing media, and viewing booking prototypes.",
    faq: [
      {
        question: "What real estate screens does this API support?",
        answer:
          "It supports property search results, listing detail pages, gallery layouts, agent context, and booking confirmation screens."
      },
      {
        question: "Does the Real Estate API include booking state?",
        answer:
          "Yes. Viewing bookings are created through a public endpoint and persisted through the platform state store."
      },
      {
        question: "Can I filter property results?",
        answer:
          "Yes. Property list requests support city, property type, price range, bedroom, bathroom, and limit filters."
      }
    ]
  },
  stays: {
    slug: "stays",
    eyebrow: "Stays API",
    title: "Prototype lodging search, availability, and reservation flows with one API.",
    metaTitle: "Stays API for Travel UI Prototypes | API Store",
    metaDescription:
      "Use the Stays API to prototype Airbnb-style lodging search, listing detail, galleries, guest filters, and reservation creation.",
    summary:
      "The Stays API models a lodging marketplace with searchable listings, hosted stay media, guest filters, nightly rates, and reservation creation.",
    audience: "Teams building travel marketplaces, lodging booking flows, host dashboards, and itinerary demos.",
    prototype:
      "A traveler can search listings by city and guest count, inspect a stay, review hosted media, choose dates, and create a dummy reservation.",
    heroImage: "/assets/stays/catskills-aframe.jpg",
    accent: "bg-rose-500",
    outcome: "Travel prototypes can validate search and booking UX without a real lodging supplier.",
    bestFor: ["Stay search", "Listing detail", "Guest filters", "Reservations"],
    workflow: [
      "Search `/v1/stays/listings` by city, guests, max nightly rate, and limit.",
      "Open `/v1/stays/listings/:id` for stay detail and gallery states.",
      "Submit `/v1/stays/reservations` with listing, dates, guest count, and guest name.",
      "Render confirmation, totals, and reservation status from the response."
    ],
    aiSummary:
      "Use the Stays API for lodging marketplace prototypes that need searchable stays, listing detail, media, and reservation state.",
    faq: [
      {
        question: "Can I prototype a travel booking flow with this API?",
        answer:
          "Yes. The API supports listing search, listing detail, and reservation creation with date and guest validation."
      },
      {
        question: "What filters are available for stay search?",
        answer:
          "The list endpoint supports city, guest count, maximum nightly rate, and limit filters for realistic search controls."
      },
      {
        question: "Are stay images hosted by the platform?",
        answer:
          "Yes. Stay responses reference stable media under `/assets/stays/*` so visual travel prototypes can render consistently."
      }
    ]
  },
  pokemon: {
    slug: "pokemon",
    eyebrow: "Passthrough API",
    title: "Use a narrow Pokemon passthrough as a familiar API integration example.",
    metaTitle: "Pokemon API Passthrough for UI Prototypes | API Store",
    metaDescription:
      "Use the Pokemon passthrough API to prototype external API states through authenticated, allowlisted public endpoints.",
    summary:
      "The Pokemon API is a small authenticated passthrough example backed by PokeAPI, useful for showing how external API data can appear in the same platform contract.",
    audience: "Teams that need a familiar dataset to test list, detail, upstream error, and passthrough UI states.",
    prototype:
      "A user can fetch a paginated Pokemon list, open a Pokemon detail record, and test external upstream response handling behind the same API key contract.",
    heroImage: "/logos/block-light.svg",
    accent: "bg-violet-500",
    outcome: "Prototype teams can compare bundled verticals with a constrained upstream passthrough.",
    bestFor: ["External API demos", "List/detail screens", "Upstream normalization", "Familiar datasets"],
    workflow: [
      "List Pokemon through `/v1/pokemon/pokemon` with an optional limit.",
      "Fetch a detail record through `/v1/pokemon/pokemon/:name`.",
      "Use the same `x-api-key` authentication as bundled vertical APIs.",
      "Handle normalized upstream errors and timeout behavior in UI states."
    ],
    aiSummary:
      "Use the Pokemon API when a prototype needs a familiar authenticated passthrough example for list and detail UI states.",
    faq: [
      {
        question: "Why is Pokemon included in API Store?",
        answer:
          "Pokemon is included as a constrained passthrough example, showing how an upstream API can fit into the same authenticated public API surface."
      },
      {
        question: "Does Pokemon use bundled dummy data?",
        answer:
          "No. It is a narrow passthrough backed by PokeAPI, while the commerce, cars, real estate, and stays APIs use platform-owned dummy data."
      },
      {
        question: "Does passthrough still require an API key?",
        answer:
          "Yes. The Pokemon passthrough follows the same public API contract: every `/v1` request requires `x-api-key`."
      }
    ]
  }
};

export const blogPosts: BlogPost[] = [
  {
    title: "The API-First Mockup Workflow for Frontend Teams",
    slug: "api-first-mockup-workflow",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    excerpt:
      "Static mockups break the moment a flow needs state. API Store gives prototype teams stable vertical APIs for search, detail, cart, checkout, booking, and media states.",
    tldr:
      "An API-first mockup workflow replaces throwaway JSON fixtures with stable authenticated APIs. Frontend teams can design against realistic responses, image URLs, validation errors, and journey state from the first prototype. API Store is built for this job: every vertical has a coherent user journey, every public route uses the same API-key contract, and every response shape is predictable enough for humans and AI coding agents to reuse across prototypes.",
    seo: {
      metaDescription:
        "Learn how an API-first mockup workflow helps frontend teams build realistic prototypes with stable dummy APIs, media, and journey state.",
      focusKeyword: "API-first mockup workflow",
      secondaryKeywords: ["frontend prototypes", "dummy APIs", "UI mockup API"],
      faq: [
        {
          question: "What is an API-first mockup workflow?",
          answer:
            "An API-first mockup workflow means prototypes consume real HTTP APIs instead of local fixture files, so list, detail, error, and mutation states can be tested early."
        },
        {
          question: "Why use dummy APIs for frontend prototypes?",
          answer:
            "Dummy APIs let teams validate screens and interactions before production services exist, while keeping request and response behavior close to the eventual integration."
        },
        {
          question: "Does API Store replace production APIs?",
          answer:
            "No. API Store is for mockups, demos, and prototype validation. It helps teams design with realistic data before they connect to production systems."
        }
      ]
    },
    sections: [
      {
        heading: "Why local fixtures slow teams down",
        body: [
          "Local JSON starts fast, but it usually turns into a private data format that only one screen understands. The first cart mutation, search filter, or empty state forces a rewrite.",
          "A shared dummy API keeps the prototype honest. Designers see real loading, auth, validation, image, and state behavior without waiting for production backend work."
        ]
      },
      {
        heading: "What API Store changes",
        body: [
          "API Store exposes cohesive vertical APIs. Each app represents a full product journey, not a random collection of sample endpoints.",
          "The public contract is deliberately simple: send `x-api-key`, call `/v1/*`, receive `{ data, meta? }` on success or `{ error }` on failure."
        ],
        bullets: ["Authenticated public routes", "Stable media URLs", "Journey state for carts, bookings, checkouts, and orders"],
        code: "curl --request GET 'http://localhost:9998/v1/ecommerce/products?category=electronics' \\\n  --header 'x-api-key: dak_your_key'"
      },
      {
        heading: "Availability",
        body: [
          "The public API catalog is available from the site root. Admin registry controls still live under `/dashboard`, but prototype builders can understand the API surface without starting there."
        ],
        cta: { label: "Browse APIs", href: "/apis" }
      }
    ]
  },
  {
    title: "How AI Coding Agents Should Use API Store",
    slug: "ai-coding-agents-api-store",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "guide",
    excerpt:
      "AI coding agents need parseable product context, stable endpoints, and honest constraints. API Store now exposes all three for mockup generation.",
    tldr:
      "AI coding agents work best when product context is structured, examples are reachable, and API behavior is predictable. API Store gives agents a narrow path: read `llms.txt`, pick a vertical, inspect the endpoint list, and generate UI against authenticated `/v1` routes. The important constraint is security: public routes still require an API key, so agents should scaffold the frontend with a configurable key rather than hardcoding secrets.",
    seo: {
      metaDescription:
        "Use API Store with AI coding agents by reading llms.txt, choosing a vertical API, and generating mockups against stable authenticated endpoints.",
      focusKeyword: "AI coding agents API",
      secondaryKeywords: ["llms.txt", "AI frontend generation", "agent-ready APIs"],
      faq: [
        {
          question: "How should an AI agent start with API Store?",
          answer:
            "The agent should read `/llms.txt`, choose the relevant vertical, use the public API pages for endpoint context, and generate UI with an API key configured outside source code."
        },
        {
          question: "Can AI agents call API Store without authentication?",
          answer:
            "No. Every public `/v1` route requires API-key authentication, so generated prototypes should accept a key through environment or user configuration."
        },
        {
          question: "Why is llms.txt useful?",
          answer:
            "`llms.txt` gives AI systems a compact, parseable overview of product purpose, constraints, links, and pricing so they do not need to infer the basics from rendered pages."
        }
      ]
    },
    sections: [
      {
        heading: "Agents need fewer choices, not more controls",
        body: [
          "A prototype agent should not have to invent a schema, scrape screenshots, or ask which fixture file matters. It should choose a vertical and start building.",
          "The API Store interface is intentionally direct: vertical pages describe the use case, endpoint lists define the contract, and blog pages explain recommended patterns."
        ]
      },
      {
        heading: "The safe generation path",
        body: [
          "Generated apps should keep keys out of source, route all requests through the documented `/v1` endpoints, and handle `{ error }` responses explicitly."
        ],
        code: "const response = await fetch(`${baseUrl}/v1/stays/listings?city=Catskills`, {\n  headers: { \"x-api-key\": apiKey }\n});"
      },
      {
        heading: "What to generate first",
        body: [
          "Start with a list screen, a detail screen, and one journey mutation. That gives the prototype enough real behavior to test layout density, empty states, optimistic UI, and error recovery."
        ],
        cta: { label: "Read agent context", href: "/llms.txt" }
      }
    ]
  },
  {
    title: "Cars API: Prototype Automotive Retail Without Inventory Plumbing",
    slug: "cars-api-automotive-retail-prototypes",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    appSlug: "cars",
    excerpt:
      "The Cars API gives automotive prototypes inventory search, dealer detail, vehicle media, carts, checkout, and financing prequalification in one vertical.",
    tldr:
      "The Cars API is built for automotive retail prototypes that need more than a product card. It includes searchable listings, dealer records, hosted vehicle media, cart state, dummy checkout, and financing prequalification. A frontend team can validate a complete buying journey without waiting for inventory systems, lender integrations, or dealer management software. The API stays deliberately dummy, but the flow feels real enough for high-fidelity design work.",
    seo: {
      metaDescription:
        "Use the Cars API to prototype automotive retail flows with vehicle inventory, dealer detail, financing, carts, and checkout.",
      focusKeyword: "Cars API prototype",
      secondaryKeywords: ["automotive API", "vehicle inventory API", "car marketplace prototype"],
      faq: [
        {
          question: "What endpoints are available in the Cars API?",
          answer:
            "The Cars API includes listing list/detail, dealer list/detail, cart create/detail/item add, checkout create, and financing prequalification create/detail endpoints."
        },
        {
          question: "Can I prototype financing flows?",
          answer:
            "Yes. The financing prequalification endpoint accepts applicant and loan inputs and returns a dummy status and estimate for UI testing."
        },
        {
          question: "Does the Cars API include vehicle images?",
          answer:
            "Yes. Vehicle records include stable platform-served images for cards, comparison pages, and listing galleries."
        }
      ]
    },
    sections: [
      {
        heading: "A complete car-buying path",
        body: [
          "Automotive prototypes often need search, detail, dealership trust, finance anxiety, and checkout all in one demo. The Cars API covers those states with one consistent contract."
        ],
        bullets: ["Inventory filters", "Dealer profiles", "Cart and checkout", "Financing estimates"]
      },
      {
        heading: "Best first screen",
        body: [
          "Start with `/v1/cars/listings` and use filters for body style, fuel type, condition, make, price, and mileage. That is enough to build a serious marketplace search page."
        ],
        code: "curl --request GET 'http://localhost:9998/v1/cars/listings?bodyStyle=suv&fuelType=electric' \\\n  --header 'x-api-key: dak_your_key'"
      },
      {
        heading: "Availability",
        body: ["The Cars API is part of the current API Store catalog and follows the standard `/v1` API-key contract."],
        cta: { label: "Open Cars API", href: "/apis/cars" }
      }
    ]
  },
  {
    title: "Ecommerce API: From Product Grid to Order Confirmation",
    slug: "ecommerce-api-product-grid-order-confirmation",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    appSlug: "ecommerce",
    excerpt:
      "Use the Ecommerce API to build retail prototypes with categories, searchable products, image galleries, carts, checkout, and orders.",
    tldr:
      "The Ecommerce API helps retail prototypes move beyond static product cards. It includes category browsing, product search, product detail, stable product media, cart creation, item additions, checkout, and order retrieval. That means a prototype can show the full path from discovery to confirmation without custom fixtures. The API is useful for storefront redesigns, checkout experiments, and AI-generated product UI mockups that need realistic state transitions.",
    seo: {
      metaDescription:
        "Prototype ecommerce UI with categories, product search, carts, checkout, and order confirmation using the Ecommerce API.",
      focusKeyword: "Ecommerce API prototype",
      secondaryKeywords: ["retail API", "product catalog API", "checkout prototype"],
      faq: [
        {
          question: "Can I build a full retail flow with this API?",
          answer:
            "Yes. The Ecommerce API supports category browsing, product search, product detail, cart creation, item additions, checkout, and order retrieval."
        },
        {
          question: "Does it include product media?",
          answer:
            "Yes. Product responses reference stable platform-hosted media suitable for product cards, galleries, and checkout thumbnails."
        },
        {
          question: "What filters can product search use?",
          answer:
            "Product search supports category, text query, price range, color, in-stock status, and result limits."
        }
      ]
    },
    sections: [
      {
        heading: "Retail prototypes need mutation state",
        body: [
          "Product grids are easy to fake. Cart totals, empty carts, checkout payloads, and order confirmation are where prototypes usually start to drift from reality."
        ]
      },
      {
        heading: "The minimum useful commerce loop",
        body: [
          "Load categories, search products, open detail, create a cart, add an item, submit checkout, and retrieve the order. Those seven steps are enough to test most storefront journeys."
        ],
        code: "curl --request GET 'http://localhost:9998/v1/ecommerce/products?q=wireless&limit=2' \\\n  --header 'x-api-key: dak_your_key'"
      },
      {
        heading: "Availability",
        body: ["The Ecommerce API is available in the public catalog with authenticated `/v1/ecommerce/*` endpoints."],
        cta: { label: "Open Ecommerce API", href: "/apis/ecommerce" }
      }
    ]
  },
  {
    title: "Real Estate API: Property Search and Viewing Booking for Mockups",
    slug: "real-estate-api-property-search-viewing-booking",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    appSlug: "real-estate",
    excerpt:
      "The Real Estate API gives property prototypes listing search, detail pages, image galleries, agent context, and viewing booking state.",
    tldr:
      "The Real Estate API is a focused dummy vertical for residential property UI. It provides searchable property records, detail responses, stable listing media, and viewing booking creation. Prototype teams can use it to test search filters, listing density, gallery treatments, agent cards, and lead capture without depending on MLS data or appointment systems. The result is a realistic property journey that remains safe, dummy, and predictable.",
    seo: {
      metaDescription:
        "Use the Real Estate API to prototype property search, listing detail, gallery media, agent context, and viewing booking flows.",
      focusKeyword: "Real Estate API prototype",
      secondaryKeywords: ["property API", "listing API", "viewing booking prototype"],
      faq: [
        {
          question: "What does the Real Estate API include?",
          answer:
            "It includes property list/detail endpoints and a viewing booking endpoint, with hosted media and listing metadata for realistic UI states."
        },
        {
          question: "Can I prototype property filters?",
          answer:
            "Yes. The list endpoint supports city, property type, price, bedrooms, bathrooms, and limit parameters."
        },
        {
          question: "Is the booking real?",
          answer:
            "No. The booking is dummy state designed for prototypes, demos, and frontend validation."
        }
      ]
    },
    sections: [
      {
        heading: "Property UIs are detail-heavy",
        body: [
          "A real estate prototype needs price, location, rooms, agent context, visual media, and a next action. A single card grid does not expose enough of the journey."
        ]
      },
      {
        heading: "Prototype the lead path",
        body: [
          "Use search for discovery, detail for listing pages, and booking creation for the conversion moment. This lets teams test the exact points where buyers need confidence."
        ],
        code: "curl --request POST 'http://localhost:9998/v1/real-estate/bookings' \\\n  --header 'x-api-key: dak_your_key' \\\n  --header 'content-type: application/json' \\\n  --data '{\"propertyId\":\"property_austin_bungalow_01\",\"startDate\":\"2026-06-12T10:00:00.000Z\",\"endDate\":\"2026-06-12T10:30:00.000Z\"}'"
      },
      {
        heading: "Availability",
        body: ["The Real Estate API is available in the public catalog with authenticated `/v1/real-estate/*` endpoints."],
        cta: { label: "Open Real Estate API", href: "/apis/real-estate" }
      }
    ]
  },
  {
    title: "Stays API: Airbnb-Style Search and Reservation Prototypes",
    slug: "stays-api-search-reservation-prototypes",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    appSlug: "stays",
    excerpt:
      "The Stays API helps travel teams prototype lodging search, listing detail, media galleries, guest filters, and reservation creation.",
    tldr:
      "The Stays API gives travel prototypes a realistic lodging journey: searchable stays, detail records, stable media, guest filters, nightly rates, and reservation creation. It is useful for marketplace screens, booking widgets, itinerary previews, and AI-generated travel interfaces. Because the API uses dummy state and a consistent response contract, teams can safely test booking UX without supplier integrations or real reservation systems.",
    seo: {
      metaDescription:
        "Build travel UI prototypes with the Stays API for lodging search, listing detail, guest filters, media, and reservations.",
      focusKeyword: "Stays API prototype",
      secondaryKeywords: ["travel API", "lodging API", "reservation prototype"],
      faq: [
        {
          question: "What can I build with the Stays API?",
          answer:
            "You can build lodging search pages, stay detail pages, guest filter controls, gallery layouts, and reservation confirmation flows."
        },
        {
          question: "Does the Stays API validate dates and guests?",
          answer:
            "Yes. Reservation requests include listing, start date, end date, and guest count, allowing prototypes to handle validation paths."
        },
        {
          question: "Is the Stays API connected to real bookings?",
          answer:
            "No. It creates dummy reservation state for UI prototypes and demos only."
        }
      ]
    },
    sections: [
      {
        heading: "Travel flows need confidence signals",
        body: [
          "A stay card is only the beginning. Travelers compare location, nightly rate, guest fit, photos, dates, and the final reservation state."
        ]
      },
      {
        heading: "A useful reservation loop",
        body: [
          "Start with city and guest filters, open a listing detail screen, then create a reservation with a date range. The response gives the prototype a real confirmation state."
        ],
        code: "curl --request GET 'http://localhost:9998/v1/stays/listings?city=Catskills&guests=2' \\\n  --header 'x-api-key: dak_your_key'"
      },
      {
        heading: "Availability",
        body: ["The Stays API is available in the public catalog with authenticated `/v1/stays/*` endpoints."],
        cta: { label: "Open Stays API", href: "/apis/stays" }
      }
    ]
  },
  {
    title: "Pokemon API: A Familiar Passthrough for UI States",
    slug: "pokemon-api-passthrough-ui-states",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "guide",
    appSlug: "pokemon",
    excerpt:
      "The Pokemon passthrough shows how an upstream API can sit behind the same authenticated API Store contract.",
    tldr:
      "The Pokemon API is intentionally small: it demonstrates authenticated passthrough behavior using a familiar dataset. Prototype teams can fetch a list, open detail records, and test upstream-style loading or error states while keeping the same API-key contract as bundled verticals. It is not the core product promise; it is a useful comparison point for teams that want to see how API Store normalizes external data access.",
    seo: {
      metaDescription:
        "Use the Pokemon passthrough API to prototype familiar list and detail UI states behind the API Store authentication contract.",
      focusKeyword: "Pokemon API passthrough",
      secondaryKeywords: ["passthrough API", "PokeAPI prototype", "external API UI"],
      faq: [
        {
          question: "What is the Pokemon API in API Store?",
          answer:
            "It is a constrained passthrough example backed by PokeAPI and exposed through authenticated API Store endpoints."
        },
        {
          question: "Should I use Pokemon for production data?",
          answer:
            "No. It is a prototype and passthrough demonstration, not a production data source owned by API Store."
        },
        {
          question: "What UI states can it test?",
          answer:
            "It can test list loading, detail loading, familiar entity rendering, and normalized upstream failure states."
        }
      ]
    },
    sections: [
      {
        heading: "Why include a passthrough example",
        body: [
          "Most API Store verticals use bundled dummy data. Pokemon gives teams a small way to test how a familiar upstream dataset behaves behind the same public contract."
        ]
      },
      {
        heading: "Use it for contrast",
        body: [
          "Compare Pokemon with ecommerce or cars when you want to understand the difference between a platform-owned dummy journey and a narrow upstream passthrough."
        ],
        code: "curl --request GET 'http://localhost:9998/v1/pokemon/pokemon?limit=2' \\\n  --header 'x-api-key: dak_your_key'"
      },
      {
        heading: "Availability",
        body: ["The Pokemon API is available as an authenticated passthrough example in the public catalog."],
        cta: { label: "Open Pokemon API", href: "/apis/pokemon" }
      }
    ]
  },
  {
    title: "Why Every Prototype API Route Still Requires Authentication",
    slug: "prototype-api-authentication",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "deep-dive",
    excerpt:
      "Dummy does not mean open. API Store keeps every public route authenticated so prototype behavior matches production expectations.",
    tldr:
      "Prototype APIs should still model secure access. API Store requires an API key for every public `/v1` route, stores only key hashes, and shows generated keys once. This protects the platform while teaching frontend prototypes to include auth, rejected requests, revoked keys, and error handling from the start. The result is a safer mockup workflow that does not normalize insecure public data access.",
    seo: {
      metaDescription:
        "API Store requires authentication for prototype APIs, helping frontend teams test secure access, rejected requests, and revoked keys early.",
      focusKeyword: "prototype API authentication",
      secondaryKeywords: ["API key auth", "dummy API security", "frontend auth states"],
      faq: [
        {
          question: "Do dummy APIs need authentication?",
          answer:
            "Yes. Authentication lets prototypes test real access behavior and avoids training teams to call public data surfaces without controls."
        },
        {
          question: "Does API Store store plaintext API keys?",
          answer:
            "No. API Store stores key hashes and only shows generated keys once."
        },
        {
          question: "How should prototypes pass the key?",
          answer:
            "Pass the key through the `x-api-key` header and keep it configurable outside committed source code."
        }
      ]
    },
    sections: [
      {
        heading: "Dummy APIs still shape habits",
        body: [
          "If a prototype starts by calling unauthenticated public routes, the production integration often inherits weak assumptions. API Store makes the secure path the default path."
        ]
      },
      {
        heading: "What this unlocks in UI",
        body: [
          "Teams can design missing key, invalid key, revoked key, disabled endpoint, and normal success states before the backend integration is real."
        ],
        code: "fetch('/v1/ecommerce/products', {\n  headers: { 'x-api-key': process.env.NEXT_PUBLIC_DUMMY_API_KEY ?? '' }\n});"
      },
      {
        heading: "Availability",
        body: ["API-key authentication is part of the platform contract for every public `/v1` route."]
      }
    ]
  },
  {
    title: "Stable Media URLs Make UI Mockups Feel Real",
    slug: "stable-media-urls-ui-mockups",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    excerpt:
      "Cards, galleries, and checkout rows need stable media. API Store serves dummy assets from the platform so prototypes stop depending on random image URLs.",
    tldr:
      "Stable media matters because UI prototypes are visual products. API Store verticals return platform-served image URLs for products, vehicles, properties, and stays, which keeps screenshots, demos, and regression checks consistent. Teams can design cards, galleries, thumbnails, and empty states with real image dimensions instead of placeholders. This also helps AI coding agents generate more complete frontends because responses include inspectable media fields.",
    seo: {
      metaDescription:
        "Stable media URLs help UI mockups render realistic product, vehicle, property, and stay images without fragile external placeholders.",
      focusKeyword: "stable media URLs",
      secondaryKeywords: ["dummy media API", "prototype images", "UI mockup assets"],
      faq: [
        {
          question: "Why do dummy APIs need stable media?",
          answer:
            "Stable media keeps visual prototypes repeatable, prevents broken third-party placeholders, and lets teams test real card and gallery layouts."
        },
        {
          question: "Where does API Store serve media?",
          answer:
            "Media is served by the platform through `/assets/*` routes and referenced by vertical API responses."
        },
        {
          question: "Can stable media help automated QA?",
          answer:
            "Yes. Repeatable images make screenshots, visual review, and generated UI checks easier to compare over time."
        }
      ]
    },
    sections: [
      {
        heading: "Placeholder images hide design problems",
        body: [
          "A generic square placeholder does not reveal crop issues, gallery rhythm, thumbnail density, or responsive media ratios. Stable vertical media does."
        ]
      },
      {
        heading: "How API Store handles media",
        body: [
          "Each bundled vertical returns media references that map to stable platform assets. That keeps the prototype fast and predictable."
        ],
        bullets: ["Vehicle galleries", "Product images", "Property interiors", "Stay photos"]
      },
      {
        heading: "Availability",
        body: ["Stable dummy media is available for Cars, Ecommerce, Real Estate, and Stays APIs."]
      }
    ]
  },
  {
    title: "Convex-Backed State for Prototype Journeys",
    slug: "convex-backed-state-prototype-journeys",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "deep-dive",
    excerpt:
      "Prototype journeys need stateful carts, bookings, reservations, and orders. API Store uses Convex as the runtime state boundary.",
    tldr:
      "Stateful prototypes are more useful than static response demos. API Store uses Convex as the single runtime state store, so carts, bookings, checkout records, reservations, and orders behave like API resources instead of local component memory. Route modules call shared state-store methods instead of reaching directly into Convex. This keeps vertical code consistent and lets tests exercise the same HTTP-backed state boundary used by the running app.",
    seo: {
      metaDescription:
        "API Store uses Convex-backed state for prototype carts, bookings, checkout, reservations, and orders through a shared state-store boundary.",
      focusKeyword: "Convex-backed prototype state",
      secondaryKeywords: ["stateful dummy API", "prototype cart API", "booking state API"],
      faq: [
        {
          question: "Why does prototype state need a real store?",
          answer:
            "A real store lets prototypes test mutation sequences, expiration, retrieval, and failure paths instead of faking everything inside the frontend."
        },
        {
          question: "Do route modules call Convex directly?",
          answer:
            "No. Vertical route modules use the shared StateStore boundary so storage details stay centralized."
        },
        {
          question: "What state does API Store support today?",
          answer:
            "Current verticals include carts, bookings, checkouts, financing records, reservations, and orders depending on the app."
        }
      ]
    },
    sections: [
      {
        heading: "Mutation flows are where prototypes become useful",
        body: [
          "A list endpoint proves a layout. A cart, booking, or checkout endpoint proves interaction design, validation, loading states, and recovery paths."
        ]
      },
      {
        heading: "The state-store boundary",
        body: [
          "Vertical routes call shared store methods, keeping Convex details out of feature modules while preserving realistic runtime behavior."
        ],
        code: "const cart = await context.store.createCart({\n  verticalSlug: 'ecommerce',\n  apiKeyId: request.apiKey.id\n});"
      },
      {
        heading: "Availability",
        body: ["Convex-backed state is already used by the current cart, booking, checkout, reservation, financing, and order flows."]
      }
    ]
  },
  {
    title: "Designing Empty, Error, and Disabled Endpoint States",
    slug: "empty-error-disabled-endpoint-states",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    excerpt:
      "A polished prototype needs more than happy paths. API Store helps teams design missing auth, disabled endpoint, validation, and not-found states.",
    tldr:
      "Useful prototypes include uncomfortable states: missing keys, invalid payloads, not-found records, disabled endpoints, and empty results. API Store returns structured errors for public routes, validates inputs, and honors app and endpoint status. Frontend teams can design recovery states early instead of discovering them during integration. This improves prototype credibility because reviewers can see how the product behaves when the system says no.",
    seo: {
      metaDescription:
        "Design better prototype error states with structured API errors for missing auth, validation failures, not-found records, and disabled endpoints.",
      focusKeyword: "prototype error states",
      secondaryKeywords: ["API error UI", "disabled endpoint UI", "empty state design"],
      faq: [
        {
          question: "What error states should a prototype include?",
          answer:
            "Include missing authentication, invalid input, unknown record, disabled endpoint, empty result, and upstream failure states when relevant."
        },
        {
          question: "Does API Store return structured errors?",
          answer:
            "Yes. Public failures return a structured `{ error }` response rather than silent or untyped failures."
        },
        {
          question: "Why test disabled endpoint states?",
          answer:
            "Disabled endpoint states help teams design clear recovery when a feature is turned off in the registry or unavailable in a given environment."
        }
      ]
    },
    sections: [
      {
        heading: "Happy paths are not enough",
        body: [
          "Teams often approve a beautiful flow that has never handled a failed request. The first production integration then exposes layout and copy gaps."
        ]
      },
      {
        heading: "API Store gives error surfaces a shape",
        body: [
          "Because success and failure envelopes are predictable, components can branch intentionally instead of checking vague truthy values."
        ],
        code: "if (!response.ok) {\n  const payload = await response.json();\n  setError(payload.error.message);\n}"
      },
      {
        heading: "Availability",
        body: ["Structured public API errors are part of the platform contract."]
      }
    ]
  },
  {
    title: "OpenAPI as a Handoff Layer Between Design and Engineering",
    slug: "openapi-design-engineering-handoff",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "guide",
    excerpt:
      "OpenAPI documents turn prototype endpoints into a shared contract for designers, frontend developers, backend engineers, and AI agents.",
    tldr:
      "OpenAPI works as a handoff layer because it describes endpoints in a format that humans and tools can inspect. API Store exposes per-app OpenAPI documents from the dashboard route, while public pages summarize the same vertical purpose in plain language. This gives teams two levels of context: strategic pages for choosing the right dummy API, and machine-readable endpoint contracts for implementation.",
    seo: {
      metaDescription:
        "Use OpenAPI as a design and engineering handoff layer for prototype APIs, endpoint contracts, and AI-generated frontend work.",
      focusKeyword: "OpenAPI design handoff",
      secondaryKeywords: ["API handoff", "frontend API contract", "OpenAPI prototype"],
      faq: [
        {
          question: "Why use OpenAPI for prototypes?",
          answer:
            "OpenAPI documents endpoint paths, methods, schemas, and auth expectations so design and engineering teams share one contract."
        },
        {
          question: "Where are API Store OpenAPI documents?",
          answer:
            "Each app has an OpenAPI JSON route under `/dashboard/apps/{slug}/openapi.json`, with dashboard access controlled by the admin session."
        },
        {
          question: "Do public pages replace OpenAPI?",
          answer:
            "No. Public pages help humans choose an API, while OpenAPI remains the machine-readable endpoint contract."
        }
      ]
    },
    sections: [
      {
        heading: "Design needs contracts too",
        body: [
          "A mockup that cannot name its endpoints leaves engineering to reverse-engineer intent. OpenAPI makes the API surface explicit."
        ]
      },
      {
        heading: "Two layers of documentation",
        body: [
          "The public catalog explains the journey. The OpenAPI JSON describes method, path, query, body, and auth details."
        ],
        code: "GET /dashboard/apps/ecommerce/openapi.json"
      },
      {
        heading: "Availability",
        body: ["Per-app OpenAPI JSON remains available through the dashboard app routes."]
      }
    ]
  },
  {
    title: "A Programmatic SEO Model for Dummy API Verticals",
    slug: "programmatic-seo-dummy-api-verticals",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "deep-dive",
    excerpt:
      "Programmatic SEO works for API Store when each vertical page has real endpoint data, journey context, FAQs, and examples instead of swapped keywords.",
    tldr:
      "Programmatic SEO only works when each generated page adds unique value. API Store uses vertical metadata, endpoint contracts, journey descriptions, sample requests, FAQs, and blog links to create pages for each dummy API. The pattern is intentionally conservative: one high-quality page per vertical before scaling to many long-tail use-case pages. That keeps the content useful for search engines, AI systems, and prototype builders.",
    seo: {
      metaDescription:
        "Learn how API Store uses programmatic SEO for dummy API vertical pages with endpoint data, FAQs, examples, and journey context.",
      focusKeyword: "programmatic SEO dummy APIs",
      secondaryKeywords: ["pSEO API pages", "API vertical pages", "template SEO pages"],
      faq: [
        {
          question: "What is the pSEO pattern for API Store?",
          answer:
            "API Store creates one useful page per API vertical using endpoint contracts, workflow copy, FAQs, and sample calls rather than thin keyword swaps."
        },
        {
          question: "Why start with vertical pages?",
          answer:
            "Vertical pages match high-intent searches such as ecommerce API prototype or real estate API mockup while staying tied to actual product data."
        },
        {
          question: "How can this scale later?",
          answer:
            "The model can expand into use-case pages, comparison pages, and template pages once each has unique data and clear search intent."
        }
      ]
    },
    sections: [
      {
        heading: "Quality before quantity",
        body: [
          "The current strategy creates one strong page per vertical instead of hundreds of thin pages. Each page has actual endpoint coverage and workflow guidance."
        ]
      },
      {
        heading: "The page template",
        body: [
          "Each vertical page includes intent, audience, endpoints, sample curl, workflow steps, FAQs, and internal links to related blog posts."
        ],
        bullets: ["Unique vertical summary", "Endpoint-derived data", "FAQPage schema", "Related content links"]
      },
      {
        heading: "Availability",
        body: ["The `/apis/{slug}` page model now covers the current API catalog."]
      }
    ]
  },
  {
    title: "What Makes a Dummy API Production-Grade?",
    slug: "production-grade-dummy-api",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "deep-dive",
    excerpt:
      "A production-grade dummy API has auth, validation, structured errors, stable media, state, tests, and a cohesive journey.",
    tldr:
      "A production-grade dummy API is not a random fake endpoint. It should require authentication, validate inputs, return structured errors, expose stable media, support realistic journey state, and keep response shapes predictable. It should also belong to a coherent vertical so frontend teams can build an end-to-end prototype. API Store applies those standards to every public `/v1` route and every app in the catalog.",
    seo: {
      metaDescription:
        "A production-grade dummy API needs auth, validation, structured errors, stable media, stateful journeys, and predictable response shapes.",
      focusKeyword: "production-grade dummy API",
      secondaryKeywords: ["dummy API quality", "mock API standards", "prototype API"],
      faq: [
        {
          question: "What is a production-grade dummy API?",
          answer:
            "It is a fake-data API that behaves like a real service: authenticated, validated, stateful where needed, and predictable under failure."
        },
        {
          question: "Why avoid random fake endpoints?",
          answer:
            "Random endpoints do not represent a complete user journey, so they fail once a prototype needs mutation, detail, or recovery states."
        },
        {
          question: "What response shape does API Store use?",
          answer:
            "Successful public responses use `{ data, meta? }`, while failures use `{ error }`."
        }
      ]
    },
    sections: [
      {
        heading: "Production-grade means behavior, not production data",
        body: [
          "The data can be dummy. The API behavior should still teach the frontend the right contract, states, and error boundaries."
        ]
      },
      {
        heading: "The quality checklist",
        body: [
          "Every route should have auth, validation, structured errors, usage recording that cannot break success responses, and tests for meaningful edge cases."
        ],
        bullets: ["API-key auth", "Schema validation", "Structured errors", "Stable media", "State-store backed journeys"]
      },
      {
        heading: "Availability",
        body: ["These principles are encoded in the API Store project contract and current vertical patterns."]
      }
    ]
  },
  {
    title: "How to Choose the Right Dummy API for a UI Prototype",
    slug: "choose-dummy-api-ui-prototype",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    excerpt:
      "Choose a dummy API by matching the prototype journey: catalog, cart, booking, checkout, order, financing, or passthrough.",
    tldr:
      "The easiest way to choose a dummy API is to map the prototype journey to the app journey. Use Ecommerce for product discovery, carts, checkout, and orders. Use Cars for inventory, dealers, financing, and checkout. Use Real Estate for property search and viewing bookings. Use Stays for lodging search and reservations. Use Pokemon when you need a familiar passthrough example rather than a platform-owned journey.",
    seo: {
      metaDescription:
        "Choose the right dummy API for UI prototypes by matching catalog, cart, checkout, booking, financing, order, and passthrough needs.",
      focusKeyword: "choose dummy API",
      secondaryKeywords: ["UI prototype API", "mock API vertical", "dummy API catalog"],
      faq: [
        {
          question: "Which API should I use for checkout prototypes?",
          answer:
            "Use Ecommerce for product checkout or Cars for vehicle checkout, depending on the domain you are prototyping."
        },
        {
          question: "Which API should I use for bookings?",
          answer:
            "Use Real Estate for viewing bookings and Stays for lodging reservations."
        },
        {
          question: "Which API is best for external passthrough examples?",
          answer:
            "Use Pokemon when you want a familiar dataset that demonstrates allowlisted upstream passthrough behavior."
        }
      ]
    },
    sections: [
      {
        heading: "Start with the journey",
        body: [
          "Do not choose by data theme alone. Choose by the actions your UI needs to support."
        ],
        bullets: ["Catalog only", "Cart and checkout", "Booking or reservation", "Financing", "External passthrough"]
      },
      {
        heading: "A practical mapping",
        body: [
          "Ecommerce is the default for retail. Cars is for high-consideration inventory and finance. Real Estate and Stays cover scheduling and reservation behavior."
        ]
      },
      {
        heading: "Availability",
        body: ["The public API catalog lists each vertical, journey, endpoint count, and sample request."]
      }
    ]
  },
  {
    title: "From Static Screen to Stateful Checkout Prototype",
    slug: "static-screen-stateful-checkout-prototype",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "tutorial",
    excerpt:
      "A checkout prototype becomes credible when cart creation, item additions, totals, validation, and order confirmation come from an API.",
    tldr:
      "A stateful checkout prototype should create a cart, add an item, read the cart, submit checkout, and render the resulting order or confirmation state. API Store supports this pattern in Ecommerce and Cars, letting teams test loading states, disabled buttons, quantity validation, and confirmation copy. The frontend still remains a mockup, but the interaction sequence behaves like a real commerce journey.",
    seo: {
      metaDescription:
        "Build a stateful checkout prototype with cart creation, item additions, checkout submission, and order or confirmation responses.",
      focusKeyword: "stateful checkout prototype",
      secondaryKeywords: ["checkout mockup", "cart API prototype", "dummy checkout API"],
      faq: [
        {
          question: "What endpoints does a checkout prototype need?",
          answer:
            "At minimum, it needs cart creation, add item, cart detail, checkout creation, and either order retrieval or a checkout confirmation response."
        },
        {
          question: "Which API Store apps support checkout?",
          answer:
            "Ecommerce supports cart, checkout, and order flows. Cars supports vehicle cart and checkout flows."
        },
        {
          question: "Should checkout prototypes handle errors?",
          answer:
            "Yes. They should handle invalid cart IDs, invalid payloads, empty carts, and missing authentication."
        }
      ]
    },
    sections: [
      {
        heading: "Why checkout needs state",
        body: [
          "Checkout screens depend on what happened before them. Without cart state, totals and confirmation pages are just illustrations."
        ]
      },
      {
        heading: "The five-step loop",
        body: [
          "Create a cart, add a product or listing, read the cart, submit checkout, and show the resulting order or confirmation."
        ],
        code: "POST /v1/ecommerce/carts\nPOST /v1/ecommerce/carts/:cartId/items\nGET /v1/ecommerce/carts/:cartId\nPOST /v1/ecommerce/checkouts\nGET /v1/ecommerce/orders/:orderId"
      },
      {
        heading: "Availability",
        body: ["Use Ecommerce for general retail checkout and Cars for vehicle checkout prototypes."]
      }
    ]
  },
  {
    title: "Booking APIs for Prototype Scheduling Flows",
    slug: "booking-apis-prototype-scheduling-flows",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "guide",
    excerpt:
      "Booking APIs let prototypes test date selection, guest counts, viewing windows, confirmation states, and validation errors.",
    tldr:
      "Booking and reservation APIs make scheduling prototypes more realistic because date selection becomes an actual request. API Store supports viewing bookings in Real Estate and lodging reservations in Stays. Both flows help frontend teams test date input, validation, confirmation pages, and error recovery before integrating with calendars, property systems, or supplier platforms. The state is dummy, but the interaction model is concrete.",
    seo: {
      metaDescription:
        "Use booking APIs to prototype scheduling flows with date selection, guest counts, viewing windows, confirmations, and validation errors.",
      focusKeyword: "booking API prototype",
      secondaryKeywords: ["reservation API", "scheduling prototype", "dummy booking API"],
      faq: [
        {
          question: "Which APIs support booking in API Store?",
          answer:
            "Real Estate supports viewing bookings, and Stays supports lodging reservations."
        },
        {
          question: "What should booking prototypes validate?",
          answer:
            "They should validate selected resource, start date, end date, guest or visitor details, and common unavailable or invalid states."
        },
        {
          question: "Are bookings connected to real calendars?",
          answer:
            "No. They are dummy state for prototypes and demos."
        }
      ]
    },
    sections: [
      {
        heading: "Scheduling is a product moment",
        body: [
          "Users need confidence when they commit to a time or date. A real API request helps reveal copy, loading, validation, and confirmation details."
        ]
      },
      {
        heading: "Two booking patterns",
        body: [
          "Real Estate models short viewing appointments. Stays models date-range reservations with guest counts."
        ],
        bullets: ["Viewing window", "Reservation date range", "Guest count", "Confirmation status"]
      },
      {
        heading: "Availability",
        body: ["Use `/v1/real-estate/bookings` or `/v1/stays/reservations` depending on the prototype domain."]
      }
    ]
  },
  {
    title: "Designing API Catalogs for Humans and AI Systems",
    slug: "api-catalogs-humans-ai-systems",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "product",
    contentType: "thought-leadership",
    excerpt:
      "An API catalog should be readable by people choosing a prototype path and parseable by AI systems generating frontend code.",
    tldr:
      "A modern API catalog has two audiences: humans and AI systems. Humans need plain-language use cases, workflows, and confidence signals. AI systems need structured summaries, stable URLs, endpoint lists, and machine-readable context files. API Store now supports both by pairing public catalog pages with `llms.txt`, sitemap coverage, structured data, and vertical pages built from endpoint metadata.",
    seo: {
      metaDescription:
        "Design API catalogs for humans and AI systems with plain-language workflows, structured endpoint data, llms.txt, and schema markup.",
      focusKeyword: "API catalog for AI systems",
      secondaryKeywords: ["AI-readable API catalog", "API directory", "llms.txt API"],
      faq: [
        {
          question: "What does a human need from an API catalog?",
          answer:
            "A human needs to know what the API is for, what workflow it supports, which endpoints exist, and how quickly they can start."
        },
        {
          question: "What does an AI system need from an API catalog?",
          answer:
            "An AI system needs structured summaries, stable URLs, endpoint names, authentication constraints, and parseable context files."
        },
        {
          question: "Does schema markup help AI search?",
          answer:
            "Yes. Structured data helps crawlers and answer engines identify page type, FAQs, articles, and product context."
        }
      ]
    },
    sections: [
      {
        heading: "Two readers, one source of truth",
        body: [
          "A catalog page should be pleasant to scan, but its core information should also be extractable without visual interpretation."
        ]
      },
      {
        heading: "The API Store pattern",
        body: [
          "Each vertical page includes natural-language positioning, endpoint-derived lists, FAQs, JSON-LD schema, and related content."
        ],
        bullets: ["Human summary", "Endpoint list", "FAQ schema", "llms.txt link"]
      },
      {
        heading: "Availability",
        body: ["The public catalog now starts at `/apis`, and agent context is available at `/llms.txt`."]
      }
    ]
  },
  {
    title: "AI SEO for API Products: Make the Contract Extractable",
    slug: "ai-seo-api-products-contract-extractable",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "technology",
    contentType: "guide",
    excerpt:
      "AI search systems cite pages that answer directly. API products should expose definitions, endpoint summaries, FAQs, schema, and machine-readable files.",
    tldr:
      "AI SEO for an API product starts with extractable truth. The page should define the product, name who it is for, list concrete endpoints, answer common questions, expose schema markup, and provide machine-readable files such as `llms.txt` and `pricing.md`. API Store follows that pattern so AI systems can understand its value without guessing from a dashboard-only interface.",
    seo: {
      metaDescription:
        "AI SEO for API products means making contracts extractable with definitions, endpoint summaries, FAQs, schema, llms.txt, and pricing.md.",
      focusKeyword: "AI SEO for API products",
      secondaryKeywords: ["answer engine optimization", "llms.txt", "API schema markup"],
      faq: [
        {
          question: "What is AI SEO for API products?",
          answer:
            "It is the practice of making API product pages structured, direct, and machine-readable so AI systems can extract and cite accurate answers."
        },
        {
          question: "What files help AI systems understand a product?",
          answer:
            "`llms.txt`, `pricing.md`, sitemap, robots.txt, and structured JSON-LD all help AI systems parse product context."
        },
        {
          question: "Should API products hide pricing from AI agents?",
          answer:
            "No. If pricing is relevant, expose a clear machine-readable pricing file so agents can compare products without rendering a dashboard."
        }
      ]
    },
    sections: [
      {
        heading: "Answer engines need direct answers",
        body: [
          "A clever hero line is not enough. AI systems need explicit descriptions, constraints, endpoint examples, and visible update dates."
        ]
      },
      {
        heading: "The extractable contract",
        body: [
          "API Store exposes public pages, structured FAQs, `llms.txt`, `pricing.md`, robots rules, and sitemap entries."
        ],
        bullets: ["Definition blocks", "Endpoint summaries", "FAQ schema", "Machine-readable files"]
      },
      {
        heading: "Availability",
        body: ["AI-readable files and structured public pages are part of this marketing surface."]
      }
    ]
  },
  {
    title: "A Practical Roadmap for the Fastest API Mockup Experience",
    slug: "roadmap-fastest-api-mockup-experience",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    category: "company",
    contentType: "guide",
    excerpt:
      "The fastest mockup experience removes setup friction, exposes public discovery, keeps keys safe, and lets users copy a working request immediately.",
    tldr:
      "The fastest API mockup experience starts with public discovery, copyable requests, clear auth, agent-readable context, and vertical pages that explain what each API can build. The next product steps are self-serve key creation, first-run examples, downloadable prompt snippets, and stronger response samples. API Store's current shift sets the foundation: the dashboard remains for admin, while the public site becomes the front door for prototype builders.",
    seo: {
      metaDescription:
        "A practical roadmap for the fastest API mockup experience: public discovery, copyable requests, safe keys, agent context, and self-serve starts.",
      focusKeyword: "fastest API mockup experience",
      secondaryKeywords: ["API mockup roadmap", "prototype API UX", "self-serve API keys"],
      faq: [
        {
          question: "What is the fastest path to use a prototype API?",
          answer:
            "Choose a vertical, copy a request, provide an API key, and build the first list/detail screen before adding mutation flows."
        },
        {
          question: "What should API Store add next?",
          answer:
            "The highest-impact next step is a safe self-serve key flow that does not require users to understand the admin dashboard."
        },
        {
          question: "Why keep the dashboard?",
          answer:
            "The dashboard is still needed for admin controls, registry state, API keys, usage, and saved response samples."
        }
      ]
    },
    sections: [
      {
        heading: "Remove setup before adding features",
        body: [
          "The fastest product experience is usually a reduction exercise. Users need fewer decisions before the first successful API call."
        ]
      },
      {
        heading: "Recommended next steps",
        body: [
          "The next layer should focus on self-serve key creation, copyable agent prompts, endpoint response examples, and a guided first call."
        ],
        bullets: ["Self-serve keys", "Copy prompt", "Try request", "Save sample"]
      },
      {
        heading: "Availability",
        body: ["The current release lays the public discovery and AI-readable foundation. The self-serve key path is the next product decision."]
      }
    ]
  }
];

export function getApiUseCase(slug: string): ApiUseCase | undefined {
  return apiUseCases[slug];
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsForApp(appSlug: string): BlogPost[] {
  return blogPosts.filter((post) => post.appSlug === appSlug).slice(0, 3);
}
