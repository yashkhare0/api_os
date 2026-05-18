"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, FlaskConical, KeyRound, Loader2, Play, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";

type TestResult =
  | {
      ok: true;
      status: number;
      statusText: string;
      durationMs: number;
      body: string;
      contentType: string;
      headers: Array<{ name: string; value: string }>;
    }
  | {
      ok: false;
      message: string;
      status?: number;
      statusText?: string;
      durationMs?: number;
      body?: string;
      contentType?: string;
      headers?: Array<{ name: string; value: string }>;
    };

export function ApiQuickTestDialog({
  requestUrl,
  method,
  curl,
  body,
  responsePreview
}: {
  requestUrl: string;
  method: string;
  curl: string;
  body?: string | undefined;
  responsePreview: string;
}) {
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const requestBodyRef = useRef<HTMLTextAreaElement>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formattedBody = useMemo(() => {
    if (!result?.body) {
      return "";
    }

    return formatResponseBody(result.body, result.contentType ?? "");
  }, [result]);

  function runRequest() {
    setResult(null);
    const apiKey = apiKeyRef.current?.value.trim() ?? "";
    const requestBody = requestBodyRef.current?.value.trim() ?? "";

    if (!apiKey) {
      setResult({
        ok: false,
        message: "Paste an active API key before running the request."
      });
      return;
    }

    startTransition(async () => {
      const startedAt = performance.now();

      try {
        const response = await fetch(requestUrl, {
          method,
          headers: {
            "x-api-key": apiKey,
            ...(requestBody.length > 0 ? { "content-type": "application/json" } : {})
          },
          ...(requestBody.length > 0 ? { body: requestBody } : {})
        });
        const bodyText = await response.text();
        const durationMs = Math.round(performance.now() - startedAt);
        const contentType = response.headers.get("content-type") ?? "";
        const responseHeaders = Array.from(response.headers.entries()).map(([name, value]) => ({ name, value }));

        if (!response.ok) {
          setResult({
            ok: false,
            status: response.status,
            statusText: response.statusText,
            durationMs,
            body: bodyText,
            contentType,
            headers: responseHeaders,
            message: response.status === 401 ? "API key rejected by the public API." : "The API returned an error."
          });
          return;
        }

        setResult({
          ok: true,
          status: response.status,
          statusText: response.statusText,
          durationMs,
          body: bodyText,
          contentType,
          headers: responseHeaders
        });
      } catch (error) {
        setResult({
          ok: false,
          message: error instanceof Error ? error.message : "The request could not be completed."
        });
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2">
          <Play className="h-4 w-4" />
          Quick test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>API quick test</DialogTitle>
          <DialogDescription>
            Run this public endpoint from the browser with a pasted API key. The key stays in this dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">Request</div>
                  <div className="mt-1 break-all font-mono text-sm">
                    <span className="font-semibold text-foreground">{method}</span> {requestUrl}
                  </div>
                </div>
                <CopyButton value={requestUrl} label="Copy request URL" toastLabel="Request URL copied" />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
                  <KeyRound className="h-3.5 w-3.5" />
                  pasted x-api-key
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-accent">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Validation notes
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="text-sm">
                    This calls the public API route directly. Dashboard admin auth is not reused or converted into API access.
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="quick-test-key">API key</Label>
                <Input
                  id="quick-test-key"
                  ref={apiKeyRef}
                  placeholder="dak_..."
                  autoComplete="off"
                />
              </div>
              {body ? (
                <div className="space-y-2">
                  <Label htmlFor="quick-test-body">Request body</Label>
                  <Textarea
                    id="quick-test-body"
                    ref={requestBodyRef}
                    defaultValue={body}
                    spellCheck={false}
                    className="min-h-36 font-mono text-xs"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-xs text-muted-foreground">
                  Response status, time, and body will appear here after the request completes.
                </div>
                <Button type="button" onClick={runRequest} disabled={pending} className="w-full gap-2 sm:w-auto">
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {pending ? "Running" : "Run request"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <Alert className={result.ok ? "border-emerald-500/40" : "border-destructive/40"}>
              <div className="flex gap-3">
                {result.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <div className="text-sm font-medium">
                      {result.ok ? "Request succeeded" : result.message}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {typeof result.status === "number" ? <span>Status {result.status}</span> : null}
                      {result.statusText ? <span>{result.statusText}</span> : null}
                      {typeof result.durationMs === "number" ? <span>{result.durationMs}ms</span> : null}
                      {result.contentType ? <span>{result.contentType}</span> : null}
                    </div>
                  </div>
                  {result.headers?.length ? (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Response headers</div>
                      <CodeBlock>
                        {result.headers.map((header) => `${header.name}: ${header.value}`).join("\n")}
                      </CodeBlock>
                    </div>
                  ) : null}
                  {formattedBody ? <CodeBlock>{formattedBody}</CodeBlock> : null}
                </div>
              </div>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FlaskConical className="h-4 w-4" />
                Curl
              </div>
              <CopyButton value={curl} label="Copy curl" toastLabel="Curl copied" />
            </div>
            <CodeBlock>{curl}</CodeBlock>
          </div>

          {body ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Body</div>
                <CopyButton value={body} label="Copy request body" toastLabel="Request body copied" />
              </div>
              <CodeBlock>{body}</CodeBlock>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Response preview</div>
              <CopyButton value={responsePreview} label="Copy response preview" toastLabel="Response preview copied" />
            </div>
            <CodeBlock>{responsePreview}</CodeBlock>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatResponseBody(body: string, contentType: string): string {
  if (contentType.includes("json")) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }

  return body;
}
