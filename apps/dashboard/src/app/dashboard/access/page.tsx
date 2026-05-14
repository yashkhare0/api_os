import { KeyRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/dashboard/confirm-action-button";
import { DataTable } from "@/components/dashboard/data-table";
import { formatDate } from "@/components/dashboard/format";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateKeyForm } from "@/components/dashboard/create-key-form";
import type { AdminApiKey } from "@/lib/admin-api";
import { revokeKeyAction } from "../actions";
import { getDashboardSummaryResult } from "../data";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;
  const activeKeys = summary.apiKeys.filter((key) => key.status === "active").length;

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <PageHeader title="Access" description="API keys are generated once and stored hashed." />
        <MetricCard title="Active keys" value={`${activeKeys}/${summary.apiKeys.length}`} icon={<KeyRound className="h-4 w-4" />} />
        <DataTable<AdminApiKey>
          rows={summary.apiKeys}
          empty="No keys yet. Create one to wake the APIs up."
          columns={[
            {
              key: "name",
              header: "Name",
              cell: (key) => <span className="font-medium">{key.name}</span>
            },
            {
              key: "prefix",
              header: "Prefix",
              cell: (key) => <span className="font-mono text-xs text-muted-foreground">{key.prefix}</span>
            },
            {
              key: "created",
              header: "Created",
              cell: (key) => <span className="text-sm text-muted-foreground">{formatDate(key.createdAt)}</span>
            },
            {
              key: "status",
              header: "Status",
              cell: (key) => <Badge variant={key.status === "active" ? "default" : "outline"}>{key.status}</Badge>
            },
            {
              key: "action",
              header: "",
              linked: false,
              headerClassName: "text-right",
              className: "text-right",
              cell: (key) =>
                key.status === "active" ? (
                  <ConfirmActionButton
                    action={revokeKeyAction}
                    hidden={{ id: key.id }}
                    title="Revoke this API key?"
                    description="Apps using this key will stop authenticating immediately. You can always create a fresh one."
                    confirmText="Revoke"
                    pendingText="Revoking"
                    successMessage="API key revoked"
                    successDescription="That key is off the board."
                    triggerText="Revoke"
                  />
                ) : null
            }
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create key</CardTitle>
          <CardDescription>Use the new key immediately; it is only shown once.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateKeyForm />
        </CardContent>
      </Card>
    </section>
  );
}
