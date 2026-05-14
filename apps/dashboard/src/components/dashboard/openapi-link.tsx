import Link from "next/link";
import { ExternalLink, FileJson } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { openApiHref } from "@/components/dashboard/format";
import { cn } from "@/lib/utils";

export function OpenApiLink({ appSlug, className }: { appSlug: string; className?: string }) {
  return (
    <Link
      href={openApiHref(appSlug)}
      target="_blank"
      rel="noreferrer"
      prefetch={false}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2", className)}
      aria-label={`Open ${appSlug} OpenAPI in a new tab`}
    >
      <FileJson className="h-4 w-4" />
      <span>OpenAPI</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}
