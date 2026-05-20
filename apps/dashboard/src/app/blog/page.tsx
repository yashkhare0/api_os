import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { blogPosts, siteConfig } from "@/lib/marketing-content";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Guides for building frontend mockups with dummy APIs, AI coding agents, programmatic SEO, and stateful prototype journeys.",
  alternates: {
    canonical: "/blog"
  }
};

export default async function BlogIndexPage() {
  const apiBaseUrl = await getPublicApiBaseUrl();
  const postsBySlug = new Map(blogPosts.map((post) => [post.slug, post]));
  const guideGroups = [
    {
      title: "App playbooks",
      description: "One guide for each live API app.",
      posts: blogPosts.filter((post) => post.appSlug)
    },
    {
      title: "Fast-start workflows",
      description: "How prototype teams choose APIs, wire state, and reach the first working call.",
      posts: [
        "api-first-mockup-workflow",
        "choose-dummy-api-ui-prototype",
        "static-screen-stateful-checkout-prototype",
        "booking-apis-prototype-scheduling-flows",
        "roadmap-fastest-api-mockup-experience"
      ].map((slug) => postsBySlug.get(slug)).filter((post): post is (typeof blogPosts)[number] => Boolean(post))
    },
    {
      title: "Implementation quality",
      description: "Auth, media, state, errors, OpenAPI handoff, and production-grade dummy API behavior.",
      posts: [
        "prototype-api-authentication",
        "stable-media-urls-ui-mockups",
        "convex-backed-state-prototype-journeys",
        "empty-error-disabled-endpoint-states",
        "openapi-design-engineering-handoff",
        "production-grade-dummy-api"
      ].map((slug) => postsBySlug.get(slug)).filter((post): post is (typeof blogPosts)[number] => Boolean(post))
    },
    {
      title: "AI and discovery",
      description: "Agent context, AI SEO, programmatic SEO, and catalog structure for machine readers.",
      posts: [
        "ai-coding-agents-api-store",
        "programmatic-seo-dummy-api-verticals",
        "api-catalogs-humans-ai-systems",
        "ai-seo-api-products-contract-extractable"
      ].map((slug) => postsBySlug.get(slug)).filter((post): post is (typeof blogPosts)[number] => Boolean(post))
    }
  ];

  return (
    <main className="marketing-surface min-h-screen bg-stone-50">
      <MarketingNav />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "API Store guides",
          description: "Guides for API-backed frontend prototypes and AI-generated mockups.",
          url: `${apiBaseUrl}/blog`,
          blogPost: blogPosts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: `${apiBaseUrl}/blog/${post.slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            description: post.excerpt
          }))
        }}
      />

      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Badge variant="outline">{blogPosts.length} guides</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">API-backed prototype guides.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Practical content for frontend teams, product thinkers, and AI agents building realistic mockups with
            stable dummy APIs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {guideGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-4 flex flex-col justify-between gap-2 border-b pb-3 md:flex-row md:items-end">
                <div>
                  <h2 className="text-2xl font-semibold">{group.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{group.description}</p>
                </div>
                <span className="text-sm text-stone-500">{group.posts.length} guides</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group rounded-lg border bg-white p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-stone-400 hover:shadow-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <Badge variant="outline">{post.contentType}</Badge>
                      {post.appSlug ? <Badge variant="outline">{post.appSlug}</Badge> : null}
                    </div>
                    <BookOpen className="mt-6 h-5 w-5 text-stone-500" />
                    <h3 className="mt-4 text-xl font-semibold leading-snug group-hover:text-emerald-700">{post.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center text-sm font-medium text-stone-900">
                      Read guide <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="border-y bg-[#f3ecd9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-stone-600">Editorial promise</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold">
            Every guide ties back to actual platform behavior, not invented roadmap claims.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-stone-700">
            Current coverage is based on the live catalog, endpoint contracts, public auth rules, state-store patterns,
            and AI-readable files in {siteConfig.name}.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
