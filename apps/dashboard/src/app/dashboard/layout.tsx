import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireAdmin } from "@/lib/session";
import { getDashboardSummaryResult } from "./data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const summaryResult = await getDashboardSummaryResult();

  return (
    <DashboardShell username={session.username} summary={summaryResult.ok ? summaryResult.summary : undefined}>
      {summaryResult.ok ? children : <Alert>{summaryResult.error}</Alert>}
    </DashboardShell>
  );
}
