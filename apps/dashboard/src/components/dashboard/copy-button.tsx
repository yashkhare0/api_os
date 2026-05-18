"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  toastLabel,
  className,
  variant = "ghost",
  size = "icon"
}: {
  value: string;
  label: string;
  toastLabel?: string;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}) {
  const [copied, setCopied] = useState(false);
  const Icon = copied ? Check : Copy;

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(toastLabel ?? `${label} copied`, {
        description: "Ready for the next tab."
      });
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Copy failed", {
        description: "Your browser blocked clipboard access."
      });
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={cn("shrink-0", copied && "text-foreground", className)}
          onClick={copyValue}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
          {size === "icon" ? null : <span className="ml-2">{label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}
