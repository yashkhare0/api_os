import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        "max-h-80 w-full min-w-0 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/35 p-3 font-mono text-xs leading-5 text-muted-foreground",
        className
      )}
    >
      {children}
    </pre>
  );
}
