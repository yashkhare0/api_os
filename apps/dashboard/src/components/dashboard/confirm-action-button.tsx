"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmActionButton({
  action,
  hidden,
  triggerText,
  triggerIcon,
  triggerVariant = "destructive",
  triggerSize = "sm",
  title,
  description,
  confirmText,
  pendingText,
  successMessage,
  successDescription,
  errorMessage = "Action failed"
}: {
  action: (formData: FormData) => Promise<void>;
  hidden: Record<string, string>;
  triggerText: string;
  triggerIcon?: "trash";
  triggerVariant?: "default" | "secondary" | "destructive" | "ghost" | "outline";
  triggerSize?: "default" | "sm" | "icon";
  title: string;
  description: string;
  confirmText: string;
  pendingText: string;
  successMessage: string;
  successDescription?: string;
  errorMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  function runAction() {
    const formData = new FormData();
    Object.entries(hidden).forEach(([name, value]) => formData.set(name, value));

    startTransition(async () => {
      try {
        await action(formData);
        toast.success(successMessage, {
          description: successDescription
        });
      } catch (error) {
        toast.error(errorMessage, {
          description: error instanceof Error ? error.message : "The platform did not accept the change."
        });
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className={cn(buttonVariants({ variant: triggerVariant, size: triggerSize }))}>
        {triggerIcon === "trash" ? <Trash2 className="mr-2 h-3.5 w-3.5" /> : null}
        {triggerText}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep it</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            disabled={pending}
            onClick={runAction}
          >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {pending ? pendingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
