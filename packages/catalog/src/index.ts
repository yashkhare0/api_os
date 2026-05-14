import type { VerticalMetadata } from "@dummy-api/core";
import { endpointsForVertical } from "@dummy-api/contracts";

export const verticals: VerticalMetadata[] = [
  {
    slug: "cars",
    name: "Cars",
    description: "Automotive inventory, dealer discovery, financing prequalification, carts, and dummy checkout.",
    journey: ["catalog", "cart", "financing", "checkout"],
    endpoints: endpointsForVertical("cars"),
    media: ["vehicle hero images", "vehicle gallery images"]
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    description: "Retail products, categories, carts, checkout, and dummy order confirmation.",
    journey: ["catalog", "cart", "checkout", "order"],
    endpoints: endpointsForVertical("ecommerce"),
    media: ["product hero images", "product gallery images"]
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    description: "Property search, listing detail, and dummy viewing bookings.",
    journey: ["catalog", "booking"],
    endpoints: endpointsForVertical("real-estate"),
    media: ["property exterior images", "interior gallery images"]
  },
  {
    slug: "stays",
    name: "Stays",
    description: "Airbnb-style stays, availability, reservations, and dummy booking confirmation.",
    journey: ["catalog", "booking", "checkout"],
    endpoints: endpointsForVertical("stays"),
    media: ["stay hero images", "amenity/gallery images"]
  },
  {
    slug: "pokemon",
    name: "Pokemon",
    description: "Passthrough example backed by the public PokeAPI.",
    journey: ["passthrough"],
    endpoints: endpointsForVertical("pokemon"),
    media: ["upstream sprite URLs"],
    upstream: {
      name: "PokeAPI",
      baseUrl: "https://pokeapi.co/api/v2"
    }
  }
];

export function getVertical(slug: string): VerticalMetadata | undefined {
  return verticals.find((vertical) => vertical.slug === slug);
}
