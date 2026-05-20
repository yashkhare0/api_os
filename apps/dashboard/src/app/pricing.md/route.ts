import { siteConfig } from "@/lib/marketing-content";
import { getConfiguredSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = getConfiguredSiteUrl();
  const markdown = `# Pricing - ${siteConfig.name}

Last updated: ${siteConfig.updatedAt}

## Local Development

- Price: $0/month for local development in this repository.
- Access: Run the dashboard/API app locally and create API keys through the admin flow.
- Included: Ecommerce, Cars, Real Estate, Stays, and Pokemon passthrough APIs.
- Limits: Local limits depend on the developer environment and configured Convex instance.
- Important: Every public \`/v1\` route requires an \`x-api-key\` header.

## Current Hosted Packaging

- Status: Not packaged as a public hosted paid plan in the current codebase.
- Access model: Protected admin dashboard for key management, app registry state, usage, and response samples.
- Public discovery: ${baseUrl}/apis
- Agent context: ${baseUrl}/llms.txt

## Future Commercial Packaging

- Status: To be defined before launch.
- Candidate packaging dimensions: included verticals, request volume, team seats, custom vertical creation, hosted environments, and support.
- Requirement: No plan should require plaintext API-key storage. Keys must remain generated once and stored as hashes.

## Buyer Fit

API Store is best for frontend teams, designers, product teams, and AI coding agents that need realistic dummy APIs for UI prototypes before production integrations are ready.
`;

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8"
    }
  });
}
