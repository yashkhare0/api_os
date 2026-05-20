import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarketingNavProps = {
  variant?: "plain" | "overlay";
};

export function MarketingNav({ variant = "plain" }: MarketingNavProps) {
  const overlay = variant === "overlay";

  return (
    <header className={cn("z-20 w-full", overlay ? "absolute left-0 top-0 text-white" : "border-b bg-background/95")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <img src={overlay ? "/logos/block-light.svg" : "/logos/block-dark.svg"} alt="" className="h-8 w-8" />
          <span>API Store</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/apis" className={cn("transition-colors", overlay ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground")}>
            APIs
          </Link>
          <Link href="/blog" className={cn("transition-colors", overlay ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground")}>
            Guides
          </Link>
          <Link
            href="/llms.txt"
            className={cn("transition-colors", overlay ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground")}
          >
            llms.txt
          </Link>
        </nav>
        <Link
          href="/apis"
          className={cn(
            buttonVariants({ variant: overlay ? "secondary" : "default", size: "sm" }),
            "mr-10 gap-2 sm:mr-0"
          )}
        >
          Pick API <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
