import Link from "next/link";
import { Activity, KeyRound, Layers3, Server } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/data-table";
import { EndpointCell } from "@/components/dashboard/endpoint-cell";
import { endpointHref } from "@/components/dashboard/format";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getDashboardSummaryResult } from "./data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;
  const activeKeys = summary.apiKeys.filter((key) => key.status === "active").length;
  const liveApps = summary.registry.apps.filter((app) => app.status === "active").length;
  const liveEndpoints = summary.registry.endpoints.filter((endpoint) => endpoint.status === "active").length;
  const requests = summary.usage.reduce((total, item) => total + item.requests, 0);
  const recentEndpoints = summary.registry.endpoints.slice(0, 6);

  return (
    <>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Live apps" value={`${liveApps}/${summary.registry.apps.length}`} icon={<Server className="h-4 w-4" />} />
        <MetricCard title="Live APIs" value={`${liveEndpoints}/${summary.registry.endpoints.length}`} icon={<Layers3 className="h-4 w-4" />} />
        <MetricCard title="Active keys" value={activeKeys} icon={<KeyRound className="h-4 w-4" />} />
        <MetricCard title="Requests" value={requests} icon={<Activity className="h-4 w-4" />} />
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Apps</CardTitle>
            <CardDescription>Live status by vertical.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.registry.apps.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/apps/${encodeURIComponent(app.slug)}`}
                className="flex items-center justify-between rounded-md border px-3 py-2 transition-colors hover:bg-accent"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{app.name}</span>
                  <span className="text-xs text-muted-foreground">{app.journey.join(", ")}</span>
                </span>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Recent APIs"
          actions={
            <Link href="/dashboard/apis" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              View all
            </Link>
          }
        />
        <DataTable
          rows={recentEndpoints}
          getRowHref={endpointHref}
          empty="No APIs registered."
          columns={[
            {
              key: "endpoint",
              header: "Endpoint",
              cell: (endpoint) => <EndpointCell method={endpoint.method} path={endpoint.path} />
            },
            {
              key: "app",
              header: "App",
              cell: (endpoint) => endpoint.appSlug
            },
            {
              key: "status",
              header: "Status",
              cell: (endpoint) => <StatusBadge status={endpoint.status} />
            }
          ]}
        />
      </section>
    </>
  );
}
