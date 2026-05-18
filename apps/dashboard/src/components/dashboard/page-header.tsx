import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Breadcrumb = {
  label: string;
  href?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  titleClassName
}: {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Breadcrumb[] | undefined;
  actions?: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="mb-2 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((breadcrumb, index) => (
              <span key={`${breadcrumb.label}-${index}`} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="text-muted-foreground">/</span> : null}
                {breadcrumb.href ? (
                  <Link href={breadcrumb.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{breadcrumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h2 className={cn("break-words text-xl font-semibold md:text-2xl", titleClassName)}>{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">{actions}</div> : null}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  actions
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div> : null}
    </div>
  );
}
