import { Activity, AlertTriangle, Timer } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { DataTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import type { UsageSummary } from "@dummy-api/core";
import { appName, getDashboardSummaryResult } from "../data";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;
  const requests = summary.usage.reduce((total, item) => total + item.requests, 0);
  const errors = summary.usage.reduce((total, item) => total + item.errors, 0);
  const p95 = summary.usage.reduce((max, item) => Math.max(max, item.p95Ms), 0);

  return (
    <section className="space-y-4">
      <PageHeader title="Usage" description="Traffic recorded by the public API middleware." />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard title="Requests" value={requests} icon={<Activity className="h-4 w-4" />} />
        <MetricCard title="Errors" value={errors} icon={<AlertTriangle className="h-4 w-4" />} />
        <MetricCard title="Worst P95" value={`${p95}ms`} icon={<Timer className="h-4 w-4" />} />
      </div>

      <DataTable<UsageSummary>
        rows={summary.usage}
        empty="No traffic yet. The runway is clear."
        columns={[
          {
            key: "app",
            header: "App",
            cell: (item) => <span className="font-medium">{appName(summary, item.verticalSlug)}</span>
          },
          {
            key: "requests",
            header: "Requests",
            cell: (item) => <span className="font-mono text-xs">{item.requests}</span>
          },
          {
            key: "errors",
            header: "Errors",
            cell: (item) => <span className="font-mono text-xs">{item.errors}</span>
          },
          {
            key: "p95",
            header: "P95",
            cell: (item) => <span className="font-mono text-xs">{item.p95Ms}ms</span>
          }
        ]}
      />
    </section>
  );
}
