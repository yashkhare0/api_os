import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

export function StatusBadge({ status }: { status: "active" | "disabled" }) {
  const label = status === "active" ? "Live" : "Disabled";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={status === "active" ? "default" : "outline"}>
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {status === "active" ? "Requests can pass through." : "Requests stop before route handling."}
      </TooltipContent>
    </Tooltip>
  );
}
