export type PropertyListing = {
  id: string;
  title: string;
  city: string;
  state: string;
  postalCode: string;
  neighborhood: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  lotSquareFeet?: number;
  monthlyHoa?: number;
  daysOnMarket: number;
  propertyType: "condo" | "house" | "townhouse";
  status: "active" | "pending";
  heroImage: string;
  gallery: string[];
  amenities: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  listingAgent: {
    name: string;
    brokerage: string;
    phone: string;
    email: string;
  };
  availableViewingWindows: string[];
};

export const propertyListings: PropertyListing[] = [
  {
    id: "property_austin_bungalow_01",
    title: "Zilker modern bungalow",
    city: "Austin",
    state: "TX",
    postalCode: "78704",
    neighborhood: "Zilker",
    address: "1904 Barton Hills Dr",
    price: 785000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1820,
    yearBuilt: 2018,
    lotSquareFeet: 6250,
    daysOnMarket: 12,
    propertyType: "house",
    status: "active",
    heroImage: "/assets/real-estate/zilker-bungalow.jpg",
    gallery: [
      "/assets/real-estate/zilker-bungalow.jpg",
      "/assets/real-estate/zilker-bungalow-living.png",
      "/assets/real-estate/zilker-bungalow-yard.png"
    ],
    amenities: ["Garden", "Covered parking", "Solar panels"],
    coordinates: { latitude: 30.2563, longitude: -97.7689 },
    listingAgent: {
      name: "Maya Chen",
      brokerage: "Hill Country Homes",
      phone: "+1-512-555-0148",
      email: "maya.chen@example.test"
    },
    availableViewingWindows: ["2026-06-03T15:00:00.000Z", "2026-06-04T18:30:00.000Z"]
  },
  {
    id: "property_chicago_loft_01",
    title: "West Loop brick loft",
    city: "Chicago",
    state: "IL",
    postalCode: "60607",
    neighborhood: "West Loop",
    address: "842 W Fulton Market",
    price: 615000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1395,
    yearBuilt: 1924,
    monthlyHoa: 648,
    daysOnMarket: 21,
    propertyType: "condo",
    status: "active",
    heroImage: "/assets/real-estate/west-loop-loft.jpg",
    gallery: [
      "/assets/real-estate/west-loop-loft.jpg",
      "/assets/real-estate/west-loop-loft-kitchen.png",
      "/assets/real-estate/west-loop-loft-bedroom.png"
    ],
    amenities: ["Doorman", "Roof deck", "Bike storage"],
    coordinates: { latitude: 41.8864, longitude: -87.6491 },
    listingAgent: {
      name: "Nora Patel",
      brokerage: "Foundry Urban Realty",
      phone: "+1-312-555-0182",
      email: "nora.patel@example.test"
    },
    availableViewingWindows: ["2026-06-05T16:00:00.000Z", "2026-06-06T14:30:00.000Z"]
  },
  {
    id: "property_denver_townhome_01",
    title: "Highlands corner townhome",
    city: "Denver",
    state: "CO",
    postalCode: "80211",
    neighborhood: "Highland",
    address: "3221 Navajo St",
    price: 720000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2140,
    yearBuilt: 2021,
    monthlyHoa: 185,
    daysOnMarket: 8,
    propertyType: "townhouse",
    status: "active",
    heroImage: "/assets/real-estate/highlands-townhome.jpg",
    gallery: [
      "/assets/real-estate/highlands-townhome.jpg",
      "/assets/real-estate/highlands-townhome-kitchen.png",
      "/assets/real-estate/highlands-townhome-rooftop.png"
    ],
    amenities: ["Mountain views", "Garage", "Rooftop patio"],
    coordinates: { latitude: 39.7618, longitude: -105.0043 },
    listingAgent: {
      name: "Elias Romero",
      brokerage: "Front Range Collective",
      phone: "+1-303-555-0116",
      email: "elias.romero@example.test"
    },
    availableViewingWindows: ["2026-06-04T17:00:00.000Z", "2026-06-07T19:00:00.000Z"]
  }
];
