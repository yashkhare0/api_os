"use client";

import { useTransition } from "react";
import { Loader2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StatusForm({
  action,
  status,
  hidden,
  label = "API surface"
}: {
  action: (formData: FormData) => Promise<void>;
  status: "active" | "disabled";
  hidden: Record<string, string>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const nextStatus = status === "active" ? "disabled" : "active";
  const Icon = status === "active" ? PowerOff : Power;
  const actionText = status === "active" ? "Disable" : "Enable";

  function runAction() {
    const formData = new FormData();
    Object.entries(hidden).forEach(([name, value]) => formData.set(name, value));
    formData.set("status", nextStatus);

    startTransition(async () => {
      try {
        await action(formData);
        toast.success(`${label} ${nextStatus === "active" ? "enabled" : "disabled"}`, {
          description:
            nextStatus === "active"
              ? "Traffic can reach it again."
              : "Public requests will now stop at the gate."
        });
      } catch (error) {
        toast.error("Status update failed", {
          description: error instanceof Error ? error.message : "Convex did not accept the change."
        });
      }
    });
  }

  if (status === "disabled") {
    return (
      <Button type="button" size="sm" disabled={pending} onClick={runAction}>
        {pending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Icon className="mr-2 h-3.5 w-3.5" />}
        {pending ? "Enabling" : actionText}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="destructive" disabled={pending}>
          <Icon className="mr-2 h-3.5 w-3.5" />
          {actionText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disable this {label.toLowerCase()}?</AlertDialogTitle>
          <AlertDialogDescription>
            This takes effect immediately. Public requests will return the platform disabled response until you enable it again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep live</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={runAction}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {pending ? "Disabling" : "Disable"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
