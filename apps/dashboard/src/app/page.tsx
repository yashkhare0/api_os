import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Code2, FileJson2, KeyRound, Layers3, Sparkles } from "lucide-react";
import { verticals } from "@dummy-api/catalog";
import { endpointContracts } from "@dummy-api/contracts";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { buildRequestUrl, sampleCurl } from "@/lib/api-examples";
import { getApiUseCase, siteConfig } from "@/lib/marketing-content";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";

export const metadata: Metadata = {
  title: {
    absolute: "API Store | Dummy APIs for UI Prototypes"
  },
  description:
    "Build frontend mockups with production-grade dummy APIs for ecommerce, cars, real estate, stays, and passthrough examples.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "API Store",
    description: "Production-grade dummy APIs for UI prototypes and AI-generated frontend mockups.",
    type: "website"
  }
};

export default async function HomePage() {
  const apiBaseUrl = await getPublicApiBaseUrl();
  const sampleContract = endpointContracts.find((contract) => contract.id === "ecommerce.products.list");

  if (!sampleContract) {
    throw new Error("Missing ecommerce products contract");
  }

  const requestUrl = buildRequestUrl(apiBaseUrl, sampleContract);
  const curl = sampleCurl(sampleContract.method, requestUrl, undefined);
  const featuredApis = verticals
    .map((vertical) => ({ vertical, useCase: getApiUseCase(vertical.slug) }))
    .filter((item): item is { vertical: (typeof verticals)[number]; useCase: NonNullable<ReturnType<typeof getApiUseCase>> } =>
      Boolean(item.useCase)
    );
  const quickRoutes = [
    { method: "GET", path: "/v1/ecommerce/products", label: "Product grid" },
    { method: "POST", path: "/v1/stays/reservations", label: "Reservation" },
    { method: "GET", path: "/v1/cars/listings", label: "Marketplace search" },
    { method: "POST", path: "/v1/real-estate/bookings", label: "Lead capture" }
  ] as const;
  const featureCards = [
    {
      icon: Code2,
      title: "Real API shapes",
      text: "Success responses use `{ data, meta? }`; failures return structured `{ error }` payloads."
    },
    {
      icon: KeyRound,
      title: "Auth from day one",
      text: "Every public `/v1` route uses `x-api-key`, so prototypes learn the production constraint early."
    },
    {
      icon: Layers3,
      title: "Complete journeys",
      text: "Each vertical includes list, detail, media, mutation, confirmation, and empty states."
    }
  ] as const;

  return (
    <main className="marketing-surface min-h-screen bg-white text-stone-950">
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

      <section className="relative isolate overflow-hidden border-b bg-white">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_32%,rgba(236,72,153,0.12),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.35),#fff_82%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:min-h-[690px] lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:px-8">
          <div>
            <Badge variant="outline" className="rounded-full border-stone-300 bg-white px-4 py-1.5 text-sm">
              OpenAPI-style dummy APIs for UI prototypes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Badge>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.04] tracking-normal text-stone-950 md:text-7xl">
              Mock frontend APIs in seconds
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-stone-700 md:text-2xl">
              Pick a vertical API and build the UI against real-looking data, hosted media, API-key auth, and stateful
              prototype flows without waiting for a backend.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apis" className={buttonVariants({ size: "default" })}>
                Browse APIs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#first-request" className={buttonVariants({ variant: "outline" })}>
                Copy first request
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.16)] ring-1 ring-stone-200">
            <p className="text-2xl font-medium text-stone-800">Unblock your prototype</p>
            <div className="mt-5 flex flex-col gap-3 rounded-md border bg-white p-3 sm:flex-row sm:items-center">
              <div className="flex min-h-12 flex-1 items-center rounded-md border bg-stone-50 px-4 text-lg text-stone-950">
                ecommerce
              </div>
              <span className="text-sm font-medium text-stone-500">.api-store.local</span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
              Launch a complete dummy API journey for product discovery, carts, checkout, media, and structured error
              states.
            </p>
            <Link
              href="/dashboard/access"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-fuchsia-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
            >
              Create API key <Sparkles className="ml-2 h-4 w-4" />
            </Link>
            <div className="mt-8 grid gap-2">
              {quickRoutes.map((route) => (
                <Link
                  key={route.path}
                  href="/apis"
                  className="grid gap-2 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-colors hover:border-stone-400 hover:bg-white sm:grid-cols-[70px_minmax(0,1fr)_140px] sm:items-center"
                >
                  <span className="font-semibold text-fuchsia-700">{route.method}</span>
                  <span className="truncate font-medium text-stone-900">{route.path}</span>
                  <span className="text-stone-500">{route.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="first-request" className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-fuchsia-700">First request</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">Copy one request into the prototype.</h2>
            <p className="mt-4 leading-7 text-stone-700">
              The landing page should make the first integration obvious. The dashboard can stay behind the scenes for
              keys, usage, and controls.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/apis/ecommerce" className={buttonVariants({ variant: "outline" })}>
                Open ecommerce API
              </Link>
              <Link href="/dashboard/access" className={buttonVariants({ variant: "secondary" })}>
                Create API key
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border bg-stone-950 text-stone-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm">
              <span className="font-medium">Ecommerce product search</span>
              <span className="text-stone-400">GET</span>
            </div>
            <pre className="whitespace-pre-wrap break-words p-4 text-sm leading-6 text-stone-200">
              <code>{curl}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {featureCards.map((item) => (
            <div key={item.title} className="rounded-lg border bg-white p-5">
              <item.icon className="h-5 w-5 text-stone-700" />
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-fuchsia-700">API catalog</p>
              <h2 className="mt-3 text-3xl font-semibold">Start with a complete vertical.</h2>
            </div>
            <Link href="/apis" className="text-sm font-medium text-stone-700 hover:text-stone-950">
              View all APIs <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredApis.map(({ vertical, useCase }) => (
              <Link
                key={vertical.slug}
                href={`/apis/${vertical.slug}`}
                className="group overflow-hidden rounded-lg border bg-white transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-stone-400 hover:shadow-md"
              >
                <img src={useCase.heroImage} alt="" className="aspect-[16/9] w-full bg-stone-100 object-cover" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-500">{useCase.eyebrow}</p>
                    <Badge variant="secondary">{vertical.endpoints.length} endpoints</Badge>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-snug group-hover:text-fuchsia-700">{vertical.name}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{useCase.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Code2, label: "Contract", value: "{ data, meta? } / { error }" },
            { icon: KeyRound, label: "Auth", value: "x-api-key on every /v1 route" },
            { icon: FileJson2, label: "AI context", value: "llms.txt, schema, sitemap" },
            { icon: Bot, label: "Prototype mode", value: "public APIs before admin controls" }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border p-5">
              <item.icon className="h-5 w-5 text-stone-600" />
              <p className="mt-4 text-sm font-medium text-stone-500">{item.label}</p>
              <p className="mt-1 font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
