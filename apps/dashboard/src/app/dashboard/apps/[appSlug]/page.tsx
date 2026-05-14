import type { ReactNode } from "react";
import { Activity, Braces, ChevronRight, ImageIcon, Plug, Power, Route } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/data-table";
import { EndpointCell } from "@/components/dashboard/endpoint-cell";
import { endpointHref } from "@/components/dashboard/format";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MissingResource } from "@/components/dashboard/missing-resource";
import { OpenApiLink } from "@/components/dashboard/openapi-link";
import { PageHeader, SectionHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusForm } from "@/components/dashboard/status-form";
import type { ApiEndpoint } from "@/lib/admin-api";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";
import { getVerticalPreview, type VerticalPreview } from "@/lib/vertical-previews";
import { setAppStatusAction, setEndpointStatusAction } from "../../actions";
import {
  endpointsForApp,
  getApp,
  getDashboardSummaryResult,
  responsesForApp,
  responsesForEndpoint,
  usageForApp
} from "../../data";

export const dynamic = "force-dynamic";

export default async function AppDetailPage({
  params
}: {
  params: Promise<{ appSlug: string }>;
}) {
  const { appSlug } = await params;
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;
  const app = getApp(summary, decodeURIComponent(appSlug));

  if (!app) {
    return <MissingResource title="App not found" description="This app is not registered in Convex." />;
  }

  const endpoints = endpointsForApp(summary, app.slug);
  const liveEndpoints = endpoints.filter((endpoint) => endpoint.status === "active").length;
  const responses = responsesForApp(summary, app.slug);
  const usage = usageForApp(summary, app.slug);
  const baseUrl = await getPublicApiBaseUrl();
  const preview = getVerticalPreview(app.slug, baseUrl);

  return (
    <section className="space-y-5">
      <PageHeader
        title={app.name}
        description={app.description}
        breadcrumbs={[{ label: "Apps", href: "/dashboard/apps" }, { label: app.name }]}
        actions={
          <>
            <OpenApiLink appSlug={app.slug} />
            <StatusBadge status={app.status} />
            <StatusForm action={setAppStatusAction} status={app.status} hidden={{ slug: app.slug }} label="App" />
          </>
        }
      />

      {preview ? (
        <VerticalExplorer
          preview={preview}
          appStatus={app.status}
          liveEndpoints={liveEndpoints}
          endpointCount={endpoints.length}
          responseCount={responses.length}
          requests={usage?.requests ?? 0}
          p95Ms={usage?.p95Ms ?? 0}
        />
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Live APIs" value={`${liveEndpoints}/${endpoints.length}`} icon={<Plug className="h-4 w-4" />} />
            <MetricCard title="Responses" value={responses.length} icon={<Braces className="h-4 w-4" />} />
            <MetricCard title="Requests" value={usage?.requests ?? 0} icon={<Activity className="h-4 w-4" />} />
            <MetricCard title="P95 latency" value={`${usage?.p95Ms ?? 0}ms`} icon={<Power className="h-4 w-4" />} />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>App metadata</CardTitle>
              <CardDescription>Registry labels shown to dashboard users.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <MetaBlock label="Journey">
                <div className="flex flex-wrap gap-1">
                  {app.journey.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </MetaBlock>
              <MetaBlock label="Media">
                <div className="flex flex-wrap gap-1">
                  {app.media.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </MetaBlock>
            </CardContent>
          </Card>
        </>
      )}

      <section className="space-y-3">
        <SectionHeader title="APIs" description="Open an endpoint to manage responses and inspect its contract." />
        <DataTable<ApiEndpoint>
          rows={endpoints}
          getRowHref={endpointHref}
          empty="No APIs registered for this app."
          columns={[
            {
              key: "endpoint",
              header: "Endpoint",
              cell: (endpoint) => <EndpointCell method={endpoint.method} path={endpoint.path} />
            },
            {
              key: "contract",
              header: "Contract",
              cell: (endpoint) => <span className="font-mono text-xs text-muted-foreground">{endpoint.contractId}</span>
            },
            {
              key: "responses",
              header: "Responses",
              cell: (endpoint) => <span className="font-mono text-xs">{responsesForEndpoint(summary, endpoint).length}</span>
            },
            {
              key: "status",
              header: "Status",
              cell: (endpoint) => <StatusBadge status={endpoint.status} />
            },
            {
              key: "action",
              header: "",
              linked: false,
              headerClassName: "text-right",
              className: "text-right",
              cell: (endpoint) => (
                <StatusForm
                  action={setEndpointStatusAction}
                  status={endpoint.status}
                  hidden={{ method: endpoint.method, path: endpoint.path }}
                  label="Endpoint"
                />
              )
            }
          ]}
        />
      </section>
    </section>
  );
}

function VerticalExplorer({
  preview,
  appStatus,
  liveEndpoints,
  endpointCount,
  responseCount,
  requests,
  p95Ms
}: {
  preview: VerticalPreview;
  appStatus: string;
  liveEndpoints: number;
  endpointCount: number;
  responseCount: number;
  requests: number;
  p95Ms: number;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {preview.eyebrow}
                </div>
                <h3 className="max-w-2xl text-2xl font-semibold leading-tight">{preview.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{preview.summary}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {preview.proof.map((item) => (
                  <div key={item.label} className="border-t pt-3">
                    <div className="text-2xl font-semibold">{item.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {preview.journey.map((step, index) => (
                  <span key={step} className="inline-flex items-center gap-2 text-sm">
                    <span className="rounded-md border bg-background px-2 py-1">{step}</span>
                    {index < preview.journey.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t bg-muted/25 p-4 lg:border-l lg:border-t-0">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Media proof
              </div>
              <div className="grid gap-3">
                {preview.media.map((item) => (
                  <figure key={item.src} className="overflow-hidden rounded-md border bg-background">
                    <img src={item.src} alt={item.label} className="aspect-[16/10] w-full object-cover" />
                    <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                      <span className="truncate font-medium">{item.label}</span>
                      <span className="shrink-0 text-muted-foreground">{item.meta}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Operational state</CardTitle>
            <CardDescription>What this app looks like in the registry right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StateLine icon={<Plug className="h-4 w-4" />} label="Live APIs" value={`${liveEndpoints}/${endpointCount}`} />
            <StateLine icon={<Braces className="h-4 w-4" />} label="Saved samples" value={String(responseCount)} />
            <StateLine icon={<Activity className="h-4 w-4" />} label="Requests" value={String(requests)} />
            <StateLine icon={<Power className="h-4 w-4" />} label="P95 latency" value={`${p95Ms}ms`} />
            <StateLine icon={<Route className="h-4 w-4" />} label="App status" value={appStatus} />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3 xl:col-span-2">
        <SectionHeader title="Representative records" description="A quick look at the data shape and generated media behind the API." />
        <div className="grid gap-3 md:grid-cols-3">
          {preview.records.map((record) => (
            <article key={record.title} className="overflow-hidden rounded-md border bg-card">
              <img src={record.image} alt={record.title} className="aspect-[16/9] w-full object-cover" />
              <div className="space-y-2 p-3">
                <div>
                  <h4 className="line-clamp-1 text-sm font-semibold">{record.title}</h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{record.description}</p>
                </div>
                <div className="truncate font-mono text-xs text-muted-foreground">{record.meta}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function StateLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-background px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono text-sm font-medium">{value}</div>
    </div>
  );
}

function MetaBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
