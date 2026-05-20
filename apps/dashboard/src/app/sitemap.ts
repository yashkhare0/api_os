import type { MetadataRoute } from "next";
import { verticals } from "@dummy-api/catalog";
import { blogPosts, siteConfig } from "@/lib/marketing-content";
import { getConfiguredSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getConfiguredSiteUrl();
  const lastModified = new Date(siteConfig.updatedAt);

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1
    },
    {
      url: `${baseUrl}/apis`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9
    },
    ...verticals.map((vertical) => ({
      url: `${baseUrl}/apis/${vertical.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85
    })),
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.75
    },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: post.appSlug ? 0.72 : 0.68
    })),
    {
      url: `${baseUrl}/llms.txt`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.65
    },
    {
      url: `${baseUrl}/pricing.md`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.55
    }
  ];
}
