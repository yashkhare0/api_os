"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { Braces, Plus } from "lucide-react";
import { toast } from "sonner";
import { createResponseAction } from "@/app/dashboard/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ApiEndpoint } from "@/lib/admin-api";
import { SubmitButton } from "./submit-button";

export function ResponseFormDialog({
  endpoints,
  selectedEndpoint,
  compact = false
}: {
  endpoints: ApiEndpoint[];
  selectedEndpoint?: ApiEndpoint | undefined;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Trigger = compact ? Button : Button;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trigger type="button" className="gap-2">
          <Plus className="h-4 w-4" />
          Add response
        </Trigger>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add response sample</DialogTitle>
          <DialogDescription>
            Store a clean JSON example so future testers know what good looks like.
          </DialogDescription>
        </DialogHeader>
        <ResponseForm endpoints={endpoints} selectedEndpoint={selectedEndpoint} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function ResponseFormSheet({
  endpoints,
  selectedEndpoint
}: {
  endpoints: ApiEndpoint[];
  selectedEndpoint?: ApiEndpoint | undefined;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add response
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add response sample</SheetTitle>
          <SheetDescription>
            A small JSON breadcrumb for whoever tests this API next.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5">
          <ResponseForm endpoints={endpoints} selectedEndpoint={selectedEndpoint} onSaved={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ResponseForm({
  endpoints,
  selectedEndpoint,
  onSaved
}: {
  endpoints: ApiEndpoint[];
  selectedEndpoint?: ApiEndpoint | undefined;
  onSaved?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function submitResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const body = String(formData.get("body") ?? "");

    try {
      JSON.parse(body);
    } catch {
      const message = "That JSON is not ready yet. Check commas, quotes, and brackets.";
      setError(message);
      toast.error("JSON needs a tiny tune-up", {
        description: message
      });
      return;
    }

    startTransition(async () => {
      try {
        await createResponseAction(formData);
        toast.success("Response sample added", {
          description: "The sample library has one more useful checkpoint."
        });
        formRef.current?.reset();
        onSaved?.();
      } catch (actionError) {
        const message = actionError instanceof Error ? actionError.message : "The response sample could not be saved.";
        setError(message);
        toast.error("Response save failed", {
          description: message
        });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={submitResponse} className="space-y-4">
      {selectedEndpoint ? (
        <input
          type="hidden"
          name="endpoint"
          value={`${selectedEndpoint.appSlug}|${selectedEndpoint.method}|${selectedEndpoint.path}`}
        />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="endpoint">Endpoint</Label>
          <Select id="endpoint" name="endpoint" required>
            {endpoints.map((endpoint) => (
              <option key={endpoint.id} value={`${endpoint.appSlug}|${endpoint.method}|${endpoint.path}`}>
                {endpoint.appSlug} - {endpoint.method} {endpoint.path}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_108px]">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Success" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="statusCode">Status</Label>
          <Input id="statusCode" name="statusCode" type="number" defaultValue={200} min={100} max={599} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">JSON body</Label>
        <Textarea
          id="body"
          name="body"
          spellCheck={false}
          className="min-h-48 font-mono text-xs"
          defaultValue={'{\n  "data": {}\n}'}
          required
        />
      </div>
      {error ? (
        <Alert className="border-destructive/40 text-sm">
          <div className="flex gap-2">
            <Braces className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        </Alert>
      ) : null}
      <SubmitButton
        className="w-full"
        pendingText="Adding response"
        disabled={pending}
        pendingOverride={pending}
        leadingIcon={<Plus className="mr-2 h-4 w-4" />}
      >
        Add response
      </SubmitButton>
    </form>
  );
}
