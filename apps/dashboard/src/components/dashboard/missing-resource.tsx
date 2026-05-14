import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "./page-header";

export function MissingResource({
  title = "Page not found",
  description = "This dashboard route does not match a registered resource.",
  backHref = "/dashboard/apps",
  backLabel = "Back to apps"
}: {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <PageHeader title={title} description={description} />
        <Link href={backHref} className={buttonVariants({ variant: "secondary" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
