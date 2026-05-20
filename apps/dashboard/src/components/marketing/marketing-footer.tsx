import Link from "next/link";
import { siteConfig } from "@/lib/marketing-content";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-stone-950 text-stone-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3 font-semibold">
            <img src="/logos/block-light.svg" alt="" className="h-8 w-8" />
            <span>{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-stone-400">{siteConfig.description}</p>
          <p className="mt-4 text-xs text-stone-500">Last updated {siteConfig.updatedAt}.</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium text-stone-200">Build</p>
          <Link href="/apis" className="block text-stone-400 hover:text-white">
            API catalog
          </Link>
          <Link href="/blog" className="block text-stone-400 hover:text-white">
            Guides
          </Link>
          <Link href="/dashboard" className="block text-stone-400 hover:text-white">
            Admin dashboard
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium text-stone-200">AI files</p>
          <Link href="/llms.txt" className="block text-stone-400 hover:text-white">
            llms.txt
          </Link>
          <Link href="/pricing.md" className="block text-stone-400 hover:text-white">
            pricing.md
          </Link>
          <Link href="/sitemap.xml" className="block text-stone-400 hover:text-white">
            sitemap.xml
          </Link>
        </div>
      </div>
    </footer>
  );
}
