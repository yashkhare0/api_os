"use client";

import { useActionState, useEffect } from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createKeyAction, type CreateKeyState } from "@/app/dashboard/actions";
import { CopyButton } from "./copy-button";

const initialState: CreateKeyState = {};

export function CreateKeyForm() {
  const [state, formAction, pending] = useActionState(createKeyAction, initialState);

  useEffect(() => {
    if (state.apiKey) {
      toast.success("API key created", {
        description: "Shown once. Copy it before you move on."
      });
    }
  }, [state.apiKey]);

  useEffect(() => {
    if (state.error) {
      toast.error("Key creation failed", {
        description: state.error
      });
    }
  }, [state.error]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Key name</Label>
        <Input id="name" name="name" placeholder="Automotive demo key" required />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="mr-2 h-4 w-4" />
        {pending ? "Creating key" : "Create key"}
      </Button>
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.apiKey ? (
        <Alert>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Copy className="h-4 w-4" />
              New key, shown once
            </div>
            <CopyButton value={state.apiKey} label="Copy API key" toastLabel="API key copied" />
          </div>
          <div className="break-all rounded-md border bg-muted/35 p-3 font-mono text-xs text-muted-foreground">
            {state.apiKey}
          </div>
        </Alert>
      ) : null}
    </form>
  );
}
