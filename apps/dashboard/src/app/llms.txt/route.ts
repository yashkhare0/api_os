import { verticals } from "@dummy-api/catalog";
import { endpointContracts } from "@dummy-api/contracts";
import { apiUseCases, blogPosts, siteConfig } from "@/lib/marketing-content";
import { getConfiguredSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = getConfiguredSiteUrl();
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `Last updated: ${siteConfig.updatedAt}`,
    "",
    "## What this product is for",
    "",
    "API Store provides authenticated dummy APIs for frontend mockups, AI-generated UI prototypes, demos, and design-to-code workflows. Use it when a prototype needs realistic list/detail data, stable media URLs, structured errors, and stateful journeys before production APIs exist.",
    "",
    "## Non-negotiable API rules",
    "",
    "- Every public `/v1` route requires an `x-api-key` header.",
    "- Do not hardcode API keys into generated source code.",
    "- Success responses use `{ data, meta? }`; failure responses use `{ error }`.",
    "- Admin controls, API-key management, registry state, usage, and saved response samples live under `/dashboard`.",
    "- Public discovery starts at `/apis`; implementation examples live on `/apis/{slug}` pages.",
    "",
    "## Key links",
    "",
    `- API catalog: ${baseUrl}/apis`,
    `- Guides: ${baseUrl}/blog`,
    `- Pricing context: ${baseUrl}/pricing.md`,
    `- Sitemap: ${baseUrl}/sitemap.xml`,
    "",
    "## API verticals",
    "",
    ...verticals.flatMap((vertical) => {
      const useCase = apiUseCases[vertical.slug];
      const contracts = endpointContracts.filter((contract) => contract.verticalSlug === vertical.slug);

      return [
        `### ${vertical.name}`,
        "",
        useCase?.aiSummary ?? vertical.description,
        "",
        `- Public page: ${baseUrl}/apis/${vertical.slug}`,
        `- Journey: ${vertical.journey.join(", ")}`,
        `- Endpoint count: ${contracts.length}`,
        ...contracts.map((contract) => `- ${contract.method} ${contract.path}`),
        ""
      ];
    }),
    "## Recommended agent workflow",
    "",
    "1. Read this file.",
    "2. Choose the vertical that matches the target prototype journey.",
    "3. Read the corresponding `/apis/{slug}` page for workflow, endpoints, and FAQ context.",
    "4. Generate UI with a configurable API key and explicit loading, empty, error, and success states.",
    "5. Prefer live `/v1` requests over local fixture data unless the user explicitly asks for offline mode.",
    "",
    "## Useful guides",
    "",
    ...blogPosts.slice(0, 10).map((post) => `- ${post.title}: ${baseUrl}/blog/${post.slug}`)
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
