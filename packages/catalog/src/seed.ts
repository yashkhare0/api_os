import { carDealers, carListings } from "./data/cars";
import { productCategories, products } from "./data/ecommerce";
import { propertyListings } from "./data/real-estate";
import { stayListings } from "./data/stays";

export type MediaAssetSeed = {
  assetKey: string;
  fileName: string;
  contentType: string;
};

export type CatalogSeed = typeof catalogSeed;

export const catalogSeed = {
  carDealers,
  carListings,
  ecommerceCategories: productCategories,
  ecommerceProducts: products,
  realEstateProperties: propertyListings,
  stayListings
};

export const mediaAssetSeeds: MediaAssetSeed[] = mediaAssetsFromCatalog();

function mediaAssetsFromCatalog(): MediaAssetSeed[] {
  const assetKeys = new Set<string>();

  for (const item of [...carListings, ...products, ...propertyListings, ...stayListings]) {
    assetKeys.add(item.heroImage);
    for (const image of item.gallery) {
      assetKeys.add(image);
    }
  }

  return Array.from(assetKeys)
    .sort()
    .map((assetKey) => ({
      assetKey,
      fileName: assetKey.split("/").at(-1) ?? assetKey,
      contentType: contentTypeForAsset(assetKey)
    }));
}

function contentTypeForAsset(assetKey: string): string {
  if (assetKey.endsWith(".jpg") || assetKey.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (assetKey.endsWith(".png")) {
    return "image/png";
  }

  if (assetKey.endsWith(".svg")) {
    return "image/svg+xml";
  }

  return "application/octet-stream";
}
