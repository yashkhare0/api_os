import { Alert } from "@/components/ui/alert";
import { DataTable } from "@/components/dashboard/data-table";
import { EndpointCell } from "@/components/dashboard/endpoint-cell";
import { endpointHref } from "@/components/dashboard/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusForm } from "@/components/dashboard/status-form";
import type { ApiEndpoint } from "@/lib/admin-api";
import { setEndpointStatusAction } from "../actions";
import { appName, getDashboardSummaryResult, responsesForEndpoint } from "../data";

export const dynamic = "force-dynamic";

export default async function ApisPage() {
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;

  return (
    <section className="space-y-4">
      <PageHeader title="APIs" description="All registered endpoints across every vertical app." />

      <DataTable<ApiEndpoint>
        rows={summary.registry.endpoints}
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
            cell: (endpoint) => appName(summary, endpoint.appSlug)
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
  );
}
