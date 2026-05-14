export type PropertyListing = {
  id: string;
  title: string;
  city: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: "condo" | "house" | "townhouse";
  heroImage: string;
  gallery: string[];
  amenities: string[];
};

export const propertyListings: PropertyListing[] = [
  {
    id: "property_austin_bungalow_01",
    title: "Zilker modern bungalow",
    city: "Austin",
    address: "1904 Barton Hills Dr",
    price: 785000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1820,
    propertyType: "house",
    heroImage: "/assets/real-estate/zilker-bungalow.svg",
    gallery: ["/assets/real-estate/zilker-bungalow.svg"],
    amenities: ["Garden", "Covered parking", "Solar panels"]
  },
  {
    id: "property_chicago_loft_01",
    title: "West Loop brick loft",
    city: "Chicago",
    address: "842 W Fulton Market",
    price: 615000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1395,
    propertyType: "condo",
    heroImage: "/assets/real-estate/west-loop-loft.svg",
    gallery: ["/assets/real-estate/west-loop-loft.svg"],
    amenities: ["Doorman", "Roof deck", "Bike storage"]
  },
  {
    id: "property_denver_townhome_01",
    title: "Highlands corner townhome",
    city: "Denver",
    address: "3221 Navajo St",
    price: 720000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2140,
    propertyType: "townhouse",
    heroImage: "/assets/real-estate/highlands-townhome.svg",
    gallery: ["/assets/real-estate/highlands-townhome.svg"],
    amenities: ["Mountain views", "Garage", "Rooftop patio"]
  }
];
