import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { blogPosts, getApiUseCase, getBlogPost, siteConfig } from "@/lib/marketing-content";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(decodeURIComponent(slug));

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.seo.metaDescription,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt
    }
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(decodeURIComponent(slug));

  if (!post) {
    notFound();
  }

  const apiBaseUrl = await getPublicApiBaseUrl();
  const appUseCase = post.appSlug ? getApiUseCase(post.appSlug) : undefined;
  const image = appUseCase?.heroImage ? `${apiBaseUrl}${appUseCase.heroImage}` : `${apiBaseUrl}/logos/block-dark.svg`;

  return (
    <main className="marketing-surface min-h-screen bg-stone-50">
      <MarketingNav />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              author: {
                "@type": "Organization",
                name: siteConfig.name
              },
              publisher: {
                "@type": "Organization",
                name: siteConfig.name,
                logo: {
                  "@type": "ImageObject",
                  url: `${apiBaseUrl}/logos/block-dark.svg`
                }
              },
              mainEntityOfPage: `${apiBaseUrl}/blog/${post.slug}`,
              keywords: [post.seo.focusKeyword, ...post.seo.secondaryKeywords].join(", ")
            },
            {
              "@type": "FAQPage",
              mainEntity: post.seo.faq.map((item) => ({
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
                { "@type": "ListItem", position: 2, name: "Guides", item: `${apiBaseUrl}/blog` },
                { "@type": "ListItem", position: 3, name: post.title, item: `${apiBaseUrl}/blog/${post.slug}` }
              ]
            }
          ]
        }}
      />

      <article>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{post.category}</Badge>
              <Badge variant="outline">{post.contentType}</Badge>
              {post.appSlug ? (
                <Link href={`/apis/${post.appSlug}`}>
                  <Badge variant="outline">{post.appSlug}</Badge>
                </Link>
              ) : null}
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Updated {post.updatedAt}
              </span>
              <span>Focus: {post.seo.focusKeyword}</span>
            </div>
            <div className="mt-8 rounded-lg border bg-[#f3ecd9] p-5">
              <p className="text-sm font-semibold uppercase text-stone-600">TL;DR</p>
              <p className="mt-3 leading-7 text-stone-800">{post.tldr}</p>
            </div>
            <div className="mt-6">
              <Link href="/apis" className={buttonVariants({ size: "default" })}>
                Pick an API <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {post.sections.map((section) => (
              <section key={section.heading} className="border-b pb-10 last:border-b-0">
                <h2 className="text-2xl font-semibold">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-stone-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-md border bg-white px-3 py-2 text-sm text-stone-700">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.code ? (
                  <pre className="mt-5 overflow-x-auto rounded-lg bg-stone-950 p-4 text-sm leading-6 text-stone-100">
                    <code>{section.code}</code>
                  </pre>
                ) : null}
                {section.cta ? (
                  <Link href={section.cta.href} className="mt-5 inline-flex items-center text-sm font-medium text-stone-900">
                    {section.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : null}
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-lg border bg-white p-5">
            <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
            <div className="mt-5 divide-y">
              {post.seo.faq.map((item) => (
                <div key={item.question} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-lg border bg-stone-950 p-5 text-white">
            <h2 className="text-xl font-semibold">Resources</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <Link href="/apis" className="rounded-md border border-white/15 px-3 py-2 text-stone-200 hover:bg-white hover:text-stone-950">
                API catalog
              </Link>
              <Link href="/llms.txt" className="rounded-md border border-white/15 px-3 py-2 text-stone-200 hover:bg-white hover:text-stone-950">
                llms.txt
              </Link>
              <Link href="/pricing.md" className="rounded-md border border-white/15 px-3 py-2 text-stone-200 hover:bg-white hover:text-stone-950">
                pricing.md
              </Link>
            </div>
          </section>
        </div>
      </article>

      <MarketingFooter />
    </main>
  );
}
