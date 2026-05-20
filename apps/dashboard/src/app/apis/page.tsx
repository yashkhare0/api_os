import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Workflow } from "lucide-react";
import { verticals } from "@dummy-api/catalog";
import { endpointContracts } from "@dummy-api/contracts";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { getApiUseCase, siteConfig } from "@/lib/marketing-content";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";

export const metadata: Metadata = {
  title: "API Catalog",
  description:
    "Browse production-grade dummy APIs for frontend prototypes: ecommerce, cars, real estate, stays, and passthrough examples.",
  alternates: {
    canonical: "/apis"
  }
};

export default async function ApiCatalogPage() {
  const apiBaseUrl = await getPublicApiBaseUrl();
  const items = verticals
    .map((vertical) => ({ vertical, useCase: getApiUseCase(vertical.slug) }))
    .filter((item): item is { vertical: (typeof verticals)[number]; useCase: NonNullable<ReturnType<typeof getApiUseCase>> } =>
      Boolean(item.useCase)
    );

  return (
    <main className="marketing-surface min-h-screen bg-stone-50">
      <MarketingNav />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "API Store vertical API catalog",
          description: siteConfig.description,
          url: `${apiBaseUrl}/apis`,
          numberOfItems: items.length,
          itemListElement: items.map(({ vertical }, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: vertical.name,
            url: `${apiBaseUrl}/apis/${vertical.slug}`
          }))
        }}
      />
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Badge variant="outline">{endpointContracts.length} authenticated endpoints</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">API catalog for frontend mockups.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Choose a vertical by the journey you need: catalog, cart, checkout, booking, financing, order, or passthrough.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map(({ vertical, useCase }) => (
            <Link
              key={vertical.slug}
              href={`/apis/${vertical.slug}`}
              className="group grid overflow-hidden rounded-lg border bg-white transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-stone-400 hover:shadow-md lg:grid-cols-[220px_minmax(0,1fr)]"
            >
              <img src={useCase.heroImage} alt="" className="aspect-[16/10] h-full w-full bg-stone-100 object-cover" />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{useCase.eyebrow}</Badge>
                  <Badge variant="outline">{vertical.endpoints.length} endpoints</Badge>
                </div>
                <h2 className="mt-4 text-2xl font-semibold group-hover:text-emerald-700">{vertical.name}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{useCase.summary}</p>
                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex gap-2">
                    <Workflow className="mt-0.5 h-4 w-4 text-stone-500" />
                    <span>{useCase.prototype}</span>
                  </div>
                  <div className="flex gap-2">
                    <Boxes className="mt-0.5 h-4 w-4 text-stone-500" />
                    <span>{vertical.journey.join(", ")}</span>
                  </div>
                </div>
                <span className="mt-5 inline-flex items-center text-sm font-medium text-stone-800">
                  Build with this API <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
