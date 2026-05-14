import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { appHref } from "@/components/dashboard/format";
import { OpenApiLink } from "@/components/dashboard/openapi-link";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusForm } from "@/components/dashboard/status-form";
import type { ApiApp } from "@/lib/admin-api";
import { setAppStatusAction } from "../actions";
import { endpointsForApp, getDashboardSummaryResult, responsesForApp, usageForApp } from "../data";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;

  return (
    <section className="space-y-4">
      <PageHeader title="Apps" description="Each app is a vertical API surface registered in Convex." />

      <DataTable<ApiApp>
        rows={summary.registry.apps}
        getRowHref={(app) => appHref(app.slug)}
        empty="No apps registered."
        columns={[
          {
            key: "app",
            header: "App",
            cell: (app) => (
              <div className="min-w-0">
                <div className="font-medium">{app.name}</div>
                <div className="mt-1 max-w-2xl truncate text-sm text-muted-foreground">{app.description}</div>
              </div>
            )
          },
          {
            key: "journey",
            header: "Journey",
            cell: (app) => (
              <div className="flex flex-wrap gap-1">
                {app.journey.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            )
          },
          {
            key: "apis",
            header: "APIs",
            cell: (app) => {
              const endpoints = endpointsForApp(summary, app.slug);
              const live = endpoints.filter((endpoint) => endpoint.status === "active").length;
              return (
                <span className="font-mono text-xs">
                  {live}/{endpoints.length}
                </span>
              );
            }
          },
          {
            key: "responses",
            header: "Responses",
            cell: (app) => <span className="font-mono text-xs">{responsesForApp(summary, app.slug).length}</span>
          },
          {
            key: "requests",
            header: "Requests",
            cell: (app) => <span className="font-mono text-xs">{usageForApp(summary, app.slug)?.requests ?? 0}</span>
          },
          {
            key: "status",
            header: "Status",
            cell: (app) => <StatusBadge status={app.status} />
          },
          {
            key: "action",
            header: "",
            linked: false,
            headerClassName: "text-right",
            className: "text-right",
            cell: (app) => (
              <div className="flex justify-end gap-2">
                <OpenApiLink appSlug={app.slug} />
                <StatusForm action={setAppStatusAction} status={app.status} hidden={{ slug: app.slug }} label="App" />
              </div>
            )
          }
        ]}
      />
    </section>
  );
}
