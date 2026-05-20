import type { MetadataRoute } from "next";
import { getConfiguredSiteUrl } from "@/lib/site-url";

const sharedRules = {
  allow: ["/", "/apis", "/blog", "/llms.txt", "/pricing.md"],
  disallow: ["/dashboard", "/login"]
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...sharedRules },
      { userAgent: "GPTBot", ...sharedRules },
      { userAgent: "ChatGPT-User", ...sharedRules },
      { userAgent: "PerplexityBot", ...sharedRules },
      { userAgent: "ClaudeBot", ...sharedRules },
      { userAgent: "anthropic-ai", ...sharedRules },
      { userAgent: "Google-Extended", ...sharedRules },
      { userAgent: "Bingbot", ...sharedRules }
    ],
    sitemap: `${getConfiguredSiteUrl()}/sitemap.xml`
  };
}
