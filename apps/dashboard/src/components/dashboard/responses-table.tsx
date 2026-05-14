import { deleteResponseAction } from "@/app/dashboard/actions";
import { DataTable } from "@/components/dashboard/data-table";
import { endpointHref, formatDate, formatJson } from "@/components/dashboard/format";
import type { AdminSummary, ApiResponse } from "@/lib/admin-api";
import { ConfirmActionButton } from "./confirm-action-button";
import { CopyButton } from "./copy-button";

export function ResponsesTable({ summary, responses }: { summary: AdminSummary; responses: ApiResponse[] }) {
  return (
    <DataTable<ApiResponse>
      rows={responses}
      getRowHref={(response) => {
        const endpoint = summary.registry.endpoints.find(
          (item) => item.method === response.method && item.path === response.path
        );
        return endpoint ? endpointHref(endpoint) : "/dashboard/responses";
      }}
      empty="No samples yet. Add one so future testers know what good looks like."
      columns={[
        {
          key: "name",
          header: "Response",
          cell: (response) => (
            <div>
              <div className="font-medium">{response.name}</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                {response.method} {response.path}
              </div>
            </div>
          )
        },
        {
          key: "app",
          header: "App",
          cell: (response) => response.appSlug
        },
        {
          key: "status",
          header: "HTTP",
          cell: (response) => <span className="font-mono text-xs">{response.statusCode}</span>
        },
        {
          key: "updated",
          header: "Updated",
          cell: (response) => <span className="text-sm text-muted-foreground">{formatDate(response.updatedAt)}</span>
        },
        {
          key: "action",
          header: "",
          linked: false,
          headerClassName: "text-right",
          className: "text-right",
          cell: (response) => (
            <div className="flex justify-end gap-1">
              <CopyButton
                value={formatJson(response.body)}
                label="Copy response JSON"
                toastLabel="Response JSON copied"
                size="icon"
              />
              <ConfirmActionButton
                action={deleteResponseAction}
                hidden={{ id: response.id }}
                title="Remove this response sample?"
                description="The endpoint will stay live, but this saved JSON sample will disappear from the library."
                confirmText="Remove"
                pendingText="Removing"
                successMessage="Response sample removed"
                successDescription="The library is tidy again."
                triggerText="Remove"
                triggerIcon="trash"
              />
            </div>
          )
        }
      ]}
    />
  );
}
