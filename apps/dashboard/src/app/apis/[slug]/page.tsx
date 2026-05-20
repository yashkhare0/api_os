import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, KeyRound, ListChecks, Terminal } from "lucide-react";
import { getVertical, verticals } from "@dummy-api/catalog";
import { endpointContracts } from "@dummy-api/contracts";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { buildRequestUrl, exampleFromSchema, sampleCurl, schemaFields } from "@/lib/api-examples";
import { getApiUseCase, getPostsForApp, siteConfig } from "@/lib/marketing-content";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";

export function generateStaticParams() {
  return verticals.map((vertical) => ({ slug: vertical.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getApiUseCase(decodeURIComponent(slug));

  if (!useCase) {
    return {};
  }

  return {
    title: useCase.metaTitle.replace(" | API Store", ""),
    description: useCase.metaDescription,
    alternates: {
      canonical: `/apis/${useCase.slug}`
    },
    openGraph: {
      title: useCase.metaTitle,
      description: useCase.metaDescription,
      type: "website"
    }
  };
}

export default async function ApiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const vertical = getVertical(decodedSlug);
  const useCase = getApiUseCase(decodedSlug);

  if (!vertical || !useCase) {
    notFound();
  }

  const apiBaseUrl = await getPublicApiBaseUrl();
  const contracts = endpointContracts.filter((contract) => contract.verticalSlug === vertical.slug);
  const sampleContract = contracts.find((contract) => contract.method === "GET") ?? contracts[0];

  if (!sampleContract) {
    notFound();
  }

  const sampleBody = exampleFromSchema(sampleContract);
  const sample = sampleCurl(sampleContract.method, buildRequestUrl(apiBaseUrl, sampleContract), sampleBody);
  const relatedPosts = getPostsForApp(vertical.slug);

  return (
    <main className="marketing-surface min-h-screen bg-stone-50">
      <MarketingNav />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              name: `${vertical.name} API`,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description: useCase.summary,
              url: `${apiBaseUrl}/apis/${vertical.slug}`,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                url: `${apiBaseUrl}/pricing.md`
              }
            },
            {
              "@type": "FAQPage",
              mainEntity: useCase.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer
                }
              }))
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: siteConfig.name, item: apiBaseUrl },
                { "@type": "ListItem", position: 2, name: "APIs", item: `${apiBaseUrl}/apis` },
                { "@type": "ListItem", position: 3, name: vertical.name, item: `${apiBaseUrl}/apis/${vertical.slug}` }
              ]
            }
          ]
        }}
      />

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{useCase.eyebrow}</Badge>
              <Badge variant="outline">{contracts.length} endpoints</Badge>
              <Badge variant="outline">API-key auth</Badge>
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{vertical.name} API</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{useCase.summary}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#sample-request" className="inline-flex h-9 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-medium text-white hover:bg-stone-800">
                Copy first request <Terminal className="ml-2 h-4 w-4" />
              </a>
              <Link
                href="/dashboard/access"
                className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium hover:bg-accent"
              >
                Create API key <KeyRound className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border bg-stone-100">
            <img src={useCase.heroImage} alt="" className="aspect-[16/11] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase text-stone-500">Best for</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {useCase.bestFor.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-stone-500">Audience</p>
            <p className="mt-3 leading-7 text-muted-foreground">{useCase.audience}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-stone-500">Prototype outcome</p>
            <p className="mt-3 leading-7 text-muted-foreground">{useCase.outcome}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-stone-600" />
            <h2 className="text-xl font-semibold">Recommended workflow</h2>
          </div>
          <ol className="mt-5 grid gap-4">
            {useCase.workflow.map((step, index) => (
              <li key={step} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-6 text-stone-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sample-request" className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">First working call</p>
            <h2 className="mt-3 text-3xl font-semibold">Create a key, then paste it into this request.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Replace `{siteConfig.defaultApiKey}` with a generated key. Every public `/v1` route requires `x-api-key`.
            </p>
            <div className="mt-6 grid gap-3 text-sm">
              {[
                { label: "Key", text: "Use `/dashboard/access` to generate a key. Keys are shown once and stored as hashes." },
                { label: "Request", text: "Run the sample against the same origin as your prototype." },
                { label: "UI", text: "Handle loading, empty, `{ error }`, and success states before styling the happy path." }
              ].map((item) => (
                <div key={item.label} className="rounded-md border bg-stone-50 p-3">
                  <p className="font-semibold text-stone-900">{item.label}</p>
                  <p className="mt-1 leading-6 text-stone-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-stone-950 p-4 text-sm leading-6 text-stone-100">
            <code>{sample}</code>
          </pre>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
          <h2 className="text-2xl font-semibold">Endpoints</h2>
        </div>
        <div className="mt-5 overflow-hidden rounded-lg border bg-white">
          {contracts.map((contract) => {
            const queryFields = schemaFields("querySchema" in contract ? contract.querySchema : undefined);
            const bodyFields = schemaFields("bodySchema" in contract ? contract.bodySchema : undefined);
            const fields = [...queryFields, ...bodyFields];

            return (
              <div key={contract.id} className="grid gap-4 border-b p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={contract.method === "GET" ? "secondary" : "default"}>{contract.method}</Badge>
                    <code className="break-all rounded bg-stone-100 px-2 py-1 text-sm">{contract.path}</code>
                  </div>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{contract.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fields.length > 0 ? (
                    fields.slice(0, 6).map((field) => (
                      <span key={`${contract.id}-${field.name}`} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">
                        {field.name}
                        {field.required ? "*" : ""}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No request fields</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#f3ecd9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-stone-600">AI summary</p>
            <h2 className="mt-3 text-3xl font-semibold">What AI agents should know</h2>
            <p className="mt-4 leading-7 text-stone-700">{useCase.aiSummary}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {useCase.faq.map((item) => (
              <article key={item.question} className="rounded-lg border border-stone-300 bg-white/70 p-5">
                <h3 className="font-semibold leading-snug">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-700">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-sky-700">Related guides</p>
              <h2 className="mt-3 text-3xl font-semibold">Build better {vertical.name.toLowerCase()} mockups.</h2>
            </div>
            <Link href="/blog" className="text-sm font-medium text-stone-700 hover:text-stone-950">
              All guides
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-lg border bg-white p-5 transition-colors hover:border-stone-400">
                <Badge variant="outline">{post.category}</Badge>
                <h3 className="mt-4 font-semibold leading-snug">{post.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium">
                  Read guide <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <MarketingFooter />
    </main>
  );
}
