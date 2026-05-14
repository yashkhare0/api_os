import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResponseFormDialog } from "@/components/dashboard/response-form";
import { ResponsesTable } from "@/components/dashboard/responses-table";
import { getDashboardSummaryResult } from "../data";

export const dynamic = "force-dynamic";

export default async function ResponsesPage() {
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;

  return (
    <section className="space-y-4">
        <PageHeader
          title="Responses"
          description="Reusable JSON samples attached to live API contracts."
          actions={<ResponseFormDialog endpoints={summary.registry.endpoints} />}
        />
        <ResponsesTable summary={summary} responses={summary.registry.responses} />
    </section>
  );
}
