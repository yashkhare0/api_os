import { MissingResource } from "@/components/dashboard/missing-resource";

export default function DashboardNotFound() {
  return (
    <MissingResource description="This dashboard route does not match a registered app or API." />
  );
}
