import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminSummary } from "@/lib/admin-api";
import { DashboardCommandMenu } from "./dashboard-command-menu";
import { DashboardNav, MobileDashboardNav } from "./dashboard-nav";
import { ThemeToggle } from "./theme-toggle";

export function DashboardShell({
  username,
  summary,
  children
}: {
  username: string;
  summary?: AdminSummary | undefined;
  children: ReactNode;
}) {
  const counts = {
    apps: summary?.registry.apps.length ?? 0,
    endpoints: summary?.registry.endpoints.length ?? 0,
    responses: summary?.registry.responses.length ?? 0,
    keys: summary?.apiKeys.length ?? 0,
    usage: summary?.usage.length ?? 0
  };

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden border-r bg-card/40 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <DashboardNav username={username} counts={counts} />
      </aside>

      <main className="min-w-0 px-4 py-5 md:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">API Operations Console</div>
              <h1 className="mt-1 truncate text-2xl font-semibold md:text-3xl">Dummy API Platform</h1>
            </div>
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <DashboardCommandMenu summary={summary} />
            </div>
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <Badge variant="outline" className="hidden sm:inline-flex">
                {username}
              </Badge>
              <DashboardCommandMenu summary={summary} />
              <ThemeToggle />
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
          <MobileDashboardNav counts={counts} />
        </header>
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
