export type StayListing = {
  id: string;
  title: string;
  city: string;
  nightlyRate: number;
  bedrooms: number;
  maxGuests: number;
  rating: number;
  host: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
};

export const stayListings: StayListing[] = [
  {
    id: "stay_malibu_canyon_01",
    title: "Canyon view studio",
    city: "Malibu",
    nightlyRate: 285,
    bedrooms: 1,
    maxGuests: 2,
    rating: 4.93,
    host: "Maya",
    heroImage: "/assets/stays/malibu-canyon.svg",
    gallery: ["/assets/stays/malibu-canyon.svg"],
    amenities: ["Ocean view", "Kitchen", "Private deck"]
  },
  {
    id: "stay_catskills_cabin_01",
    title: "Woodland A-frame",
    city: "Catskills",
    nightlyRate: 340,
    bedrooms: 3,
    maxGuests: 6,
    rating: 4.88,
    host: "Jonas",
    heroImage: "/assets/stays/catskills-aframe.svg",
    gallery: ["/assets/stays/catskills-aframe.svg"],
    amenities: ["Hot tub", "Fireplace", "Trail access"]
  },
  {
    id: "stay_sedona_casita_01",
    title: "Red rock casita",
    city: "Sedona",
    nightlyRate: 220,
    bedrooms: 2,
    maxGuests: 4,
    rating: 4.96,
    host: "Elena",
    heroImage: "/assets/stays/sedona-casita.svg",
    gallery: ["/assets/stays/sedona-casita.svg"],
    amenities: ["Patio", "Washer", "Dedicated workspace"]
  }
];
