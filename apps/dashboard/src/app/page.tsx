import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { verticals } from "@dummy-api/catalog";
import { endpointContracts } from "@dummy-api/contracts";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiUseCase, siteConfig } from "@/lib/marketing-content";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";

type FeaturedApi = {
  vertical: (typeof verticals)[number];
  useCase: NonNullable<ReturnType<typeof getApiUseCase>>;
};

export const metadata: Metadata = {
  title: {
    absolute: "API Store | Dummy APIs for UI Prototypes"
  },
  description:
    "Browse production-grade dummy APIs for frontend prototypes: ecommerce, cars, real estate, stays, and passthrough examples.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "API Store",
    description: "Browse dummy API apps for AI-generated and hand-built frontend prototypes.",
    type: "website"
  }
};

export default async function HomePage() {
  const apiBaseUrl = await getPublicApiBaseUrl();
  const featuredApis = verticals
    .map((vertical) => ({ vertical, useCase: getApiUseCase(vertical.slug) }))
    .filter((item): item is FeaturedApi => Boolean(item.useCase));
  const endpointCount = endpointContracts.length;
  const catalogGroups = [
    { value: "all", label: "All", items: featuredApis },
    {
      value: "commerce",
      label: "Commerce",
      items: featuredApis.filter(({ vertical }) => ["ecommerce", "cars"].includes(vertical.slug))
    },
    {
      value: "booking",
      label: "Booking",
      items: featuredApis.filter(({ vertical }) => vertical.journey.includes("booking"))
    },
    {
      value: "catalog",
      label: "Catalog",
      items: featuredApis.filter(({ vertical }) => vertical.journey.includes("catalog"))
    },
    {
      value: "passthrough",
      label: "Passthrough",
      items: featuredApis.filter(({ vertical }) => Boolean(vertical.upstream))
    }
  ];

  return (
    <main className="marketing-surface min-h-screen bg-background text-foreground">
      <MarketingNav />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: siteConfig.name,
              url: apiBaseUrl,
              description: siteConfig.description
            },
            {
              "@type": "WebSite",
              name: siteConfig.name,
              url: apiBaseUrl,
              description: siteConfig.description
            },
            {
              "@type": "SoftwareApplication",
              name: siteConfig.name,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description: siteConfig.description,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                url: `${apiBaseUrl}/pricing.md`
              }
            }
          ]
        }}
      />

      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge variant="secondary">
                {featuredApis.length} API apps / {endpointCount} endpoints
              </Badge>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal md:text-6xl">API Store</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                Browse ready-made dummy API apps for UI prototypes. Pick a vertical, open its endpoints, and build with
                stable media, auth, and realistic journeys.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="#api-catalog" className={buttonVariants()}>
                Browse APIs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/dashboard/access" className={buttonVariants({ variant: "outline" })}>
                Create API key
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="api-catalog" className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">Browse APIs</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Store-style cards for every API app currently available.
              </p>
            </div>
            <Link href="/apis" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Full catalog <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </div>

          <Tabs defaultValue="all" className="mt-6">
            <TabsList className="h-auto flex-wrap justify-start">
              {catalogGroups.map((group) => (
                <TabsTrigger key={group.value} value={group.value}>
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {catalogGroups.map((group) => (
              <TabsContent key={group.value} value={group.value} className="mt-6">
                {group.items.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((item) => (
                      <ApiStoreCard key={item.vertical.slug} item={item} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No APIs in this category yet</CardTitle>
                      <CardDescription>New verticals will appear here after they are added to the catalog.</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}

function ApiStoreCard({ item }: { item: FeaturedApi }) {
  const { vertical, useCase } = item;
  const endpointPreview = vertical.endpoints.slice(0, 3);

  return (
    <Link href={`/apis/${vertical.slug}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-colors hover:border-foreground/30">
        <img src={useCase.heroImage} alt="" className="aspect-[16/9] w-full bg-muted object-cover" />
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <Badge variant="outline">{useCase.eyebrow}</Badge>
            <Badge variant="secondary">{vertical.endpoints.length} endpoints</Badge>
          </div>
          <CardTitle className="text-xl leading-tight">{vertical.name}</CardTitle>
          <CardDescription className="line-clamp-2 leading-6">{useCase.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {vertical.journey.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
          <div className="mt-5 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              {vertical.media.length} media types
            </div>
            <div className="mt-3 grid gap-2">
              {endpointPreview.map((endpoint) => (
                <div key={endpoint} className="truncate text-sm text-muted-foreground">
                  {endpoint}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center text-sm font-medium">
              Open API <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
