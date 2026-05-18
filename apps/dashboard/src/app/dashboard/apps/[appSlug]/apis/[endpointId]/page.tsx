import type { ReactNode } from "react";
import { endpointContracts, type ApiEndpointContract } from "@dummy-api/contracts";
import { Braces, Code2, FileJson, KeyRound, ListChecks, Route, ShieldCheck, Terminal } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ApiQuickTestDialog } from "@/components/dashboard/api-quick-test-dialog";
import { CodeBlock } from "@/components/dashboard/code-block";
import { CopyButton } from "@/components/dashboard/copy-button";
import { appHref, formatJson } from "@/components/dashboard/format";
import { MissingResource } from "@/components/dashboard/missing-resource";
import { PageHeader, SectionHeader } from "@/components/dashboard/page-header";
import { ResponseFormDialog } from "@/components/dashboard/response-form";
import { ResponsesTable } from "@/components/dashboard/responses-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusForm } from "@/components/dashboard/status-form";
import {
  buildRequestUrl,
  exampleFromSchema,
  pathParamNames,
  sampleCurl,
  type SchemaField,
  schemaFields
} from "@/lib/api-examples";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";
import { setEndpointStatusAction } from "../../../../actions";
import { getApp, getDashboardSummaryResult, getEndpoint, responsesForEndpoint } from "../../../../data";

export const dynamic = "force-dynamic";

export default async function ApiDetailPage({
  params
}: {
  params: Promise<{ appSlug: string; endpointId: string }>;
}) {
  const { appSlug, endpointId } = await params;
  const summaryResult = await getDashboardSummaryResult();

  if (!summaryResult.ok) {
    return <Alert>{summaryResult.error}</Alert>;
  }

  const summary = summaryResult.summary;
  const app = getApp(summary, decodeURIComponent(appSlug));
  const endpoint = getEndpoint(summary, decodeURIComponent(endpointId));

  if (!app) {
    return <MissingResource title="App not found" description="This app is not registered in Convex." />;
  }

  if (!endpoint || endpoint.appSlug !== app.slug) {
    return (
      <MissingResource
        title="API not found"
        description="This endpoint is not registered for the selected app."
        backHref={appHref(app.slug)}
        backLabel="Back to app"
      />
    );
  }

  const contract = endpointContracts.find((item) => item.id === endpoint.contractId) as ApiEndpointContract | undefined;
  const responses = responsesForEndpoint(summary, endpoint);
  const baseUrl = await getPublicApiBaseUrl();
  const requestUrl = contract
    ? buildRequestUrl(baseUrl, contract)
    : `${baseUrl.replace(/\/+$/, "")}${endpoint.path}`;
  const bodyExample = contract ? exampleFromSchema(contract) : undefined;
  const curl = sampleCurl(endpoint.method, requestUrl, bodyExample);
  const fetchSnippet = sampleFetchSnippet(endpoint.method, requestUrl, bodyExample);
  const pythonSnippet = samplePythonSnippet(endpoint.method, requestUrl, bodyExample);
  const contractJson = JSON.stringify(contract ?? { error: "Contract not found." }, null, 2);
  const responsePreview = responses[0]
    ? formatJson(responses[0].body)
    : '{\n  "data": "Add a sample to preview it here."\n}';
  const pathParams = pathParamNames(endpoint.path);
  const queryFields = schemaFields(contract?.querySchema);
  const bodyFields = schemaFields(contract?.bodySchema);
  const inputCount = pathParams.length + queryFields.length + bodyFields.length;
  const requestKit = requestKitSnippet({
    method: endpoint.method,
    requestUrl,
    curl,
    fetchSnippet,
    pythonSnippet,
    body: bodyExample,
    responsePreview
  });

  return (
    <section className="space-y-6">
      <PageHeader
        title={
          <>
            <span className="text-foreground">{endpoint.method}</span> {endpoint.path}
          </>
        }
        titleClassName="font-mono"
        description={`${app.name} · ${endpoint.contractId}`}
        breadcrumbs={[
          { label: "Apps", href: "/dashboard/apps" },
          { label: app.name, href: appHref(app.slug) },
          { label: "API detail" }
        ]}
        actions={
          <>
            <StatusBadge status={endpoint.status} />
            <StatusForm
              action={setEndpointStatusAction}
              status={endpoint.status}
              hidden={{ method: endpoint.method, path: endpoint.path }}
              label="Endpoint"
            />
          </>
        }
      />

      <ApiWorkbench
        appSlug={app.slug}
        method={endpoint.method}
        path={endpoint.path}
        requestUrl={requestUrl}
        curl={curl}
        fetchSnippet={fetchSnippet}
        pythonSnippet={pythonSnippet}
        requestKit={requestKit}
        bodyExample={bodyExample}
        responsePreview={responsePreview}
        responseName={responses[0]?.name}
        responseCount={responses.length}
        inputCount={inputCount}
        contractId={endpoint.contractId}
        endpoints={summary.registry.endpoints}
        endpoint={endpoint}
      />

      <Tabs defaultValue="inputs" className="overflow-hidden rounded-lg border bg-card">
        <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Reference</h3>
            <p className="text-sm text-muted-foreground">The details you need after the copy-paste moment.</p>
          </div>
          <TabsList className="w-full justify-start overflow-x-auto md:w-auto">
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inputs" className="m-0">
          <div className="grid gap-0 md:grid-cols-3">
            <RequestPane icon={<Route className="h-4 w-4" />} title="Path params">
              <ParamsList names={pathParams} />
            </RequestPane>
            <RequestPane icon={<FileJson className="h-4 w-4" />} title="Query">
              <SchemaFields fields={queryFields} />
            </RequestPane>
            <RequestPane icon={<Braces className="h-4 w-4" />} title="Body">
              <SchemaFields fields={bodyFields} />
            </RequestPane>
          </div>
        </TabsContent>

        <TabsContent value="responses" className="m-0 p-4">
          <div className="space-y-3">
            <SectionHeader
              title="Response samples"
              description="Saved JSON examples for testers and generated apps."
              actions={<ResponseFormDialog endpoints={summary.registry.endpoints} selectedEndpoint={endpoint} />}
            />
            <ResponsesTable summary={summary} responses={responses} />
          </div>
        </TabsContent>

        <TabsContent value="contract" className="m-0 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">Contract JSON</h3>
              <p className="text-sm text-muted-foreground">Source of truth from the contracts package.</p>
            </div>
            <CopyButton value={contractJson} label="Copy contract JSON" toastLabel="Contract JSON copied" size="sm" />
          </div>
          <CodeBlock className="max-h-[520px]">{contractJson}</CodeBlock>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ApiWorkbench({
  appSlug,
  method,
  path,
  requestUrl,
  curl,
  fetchSnippet,
  pythonSnippet,
  requestKit,
  bodyExample,
  responsePreview,
  responseName,
  responseCount,
  inputCount,
  contractId,
  endpoints,
  endpoint
}: {
  appSlug: string;
  method: string;
  path: string;
  requestUrl: string;
  curl: string;
  fetchSnippet: string;
  pythonSnippet: string;
  requestKit: string;
  bodyExample?: string | undefined;
  responsePreview: string;
  responseName?: string | undefined;
  responseCount: number;
  inputCount: number;
  contractId: string;
  endpoints: Parameters<typeof ResponseFormDialog>[0]["endpoints"];
  endpoint: Parameters<typeof ResponseFormDialog>[0]["selectedEndpoint"];
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="min-w-0 space-y-5 p-4 sm:p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              Use this API
            </div>
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start">
              <Badge className="w-fit font-mono">{method}</Badge>
              <div className="min-w-0 flex-1">
                <div className="break-all font-mono text-sm text-foreground">{requestUrl}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{appSlug}</span>
                  <span>/</span>
                  <span>{path}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={requestUrl} label="Copy URL" toastLabel="Request URL copied" size="sm" variant="secondary" />
              <CopyButton value={curl} label="Copy curl" toastLabel="Curl copied" size="sm" variant="outline" />
              <CopyButton value={requestKit} label="Copy API kit" toastLabel="API kit copied" size="sm" variant="outline" />
              <ApiQuickTestDialog
                requestUrl={requestUrl}
                method={method}
                curl={curl}
                body={bodyExample}
                responsePreview={responsePreview}
              />
            </div>
          </div>

          <Tabs defaultValue="curl" className="min-w-0 space-y-3">
            <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="fetch">Fetch</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="body" disabled={!bodyExample}>
                Body
              </TabsTrigger>
            </TabsList>
            <SnippetTab value="curl" label="Copy curl" toastLabel="Curl copied" code={curl} />
            <SnippetTab value="fetch" label="Copy fetch" toastLabel="Fetch snippet copied" code={fetchSnippet} />
            <SnippetTab value="python" label="Copy Python" toastLabel="Python snippet copied" code={pythonSnippet} />
            {bodyExample ? (
              <SnippetTab value="body" label="Copy body" toastLabel="Request body copied" code={bodyExample} />
            ) : null}
          </Tabs>
        </div>

        <aside className="min-w-0 border-t bg-muted/20 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Braces className="h-3.5 w-3.5" />
                Expected response
              </div>
              <h3 className="mt-2 text-base font-semibold">{responseName ?? "No saved sample yet"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {responseCount > 0
                  ? `${responseCount} saved sample${responseCount === 1 ? "" : "s"} for this endpoint.`
                  : "Add one so app builders know what good looks like."}
              </p>
            </div>
            <CopyButton
              value={responsePreview}
              label="Copy response JSON"
              toastLabel="Response JSON copied"
              size="sm"
              variant="outline"
            />
          </div>
          <CodeBlock className="max-h-[380px] bg-background/70">{responsePreview}</CodeBlock>
          {responseCount === 0 ? (
            <div className="mt-3 rounded-md border border-dashed bg-background/60 p-3">
              <div className="mb-3 text-sm text-muted-foreground">
                This endpoint is callable, but the response library is empty.
              </div>
              <ResponseFormDialog endpoints={endpoints} selectedEndpoint={endpoint} />
            </div>
          ) : null}
        </aside>
      </div>

      <div className="grid border-t bg-muted/15 md:grid-cols-4">
        <WorkbenchFact icon={<KeyRound className="h-4 w-4" />} label="Auth" value="x-api-key header" />
        <WorkbenchFact icon={<ListChecks className="h-4 w-4" />} label="Inputs" value={`${inputCount} field${inputCount === 1 ? "" : "s"}`} />
        <WorkbenchFact icon={<ShieldCheck className="h-4 w-4" />} label="Contract" value={contractId} />
        <WorkbenchFact icon={<Code2 className="h-4 w-4" />} label="Best copy" value="API kit" />
      </div>
    </section>
  );
}

function SnippetTab({
  value,
  label,
  toastLabel,
  code
}: {
  value: string;
  label: string;
  toastLabel: string;
  code: string;
}) {
  return (
    <TabsContent value={value} className="m-0 min-w-0 overflow-hidden rounded-md border bg-muted/20">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b bg-background/60 px-3 py-2">
        <span className="text-sm font-medium">{value === "curl" ? "cURL" : value}</span>
        <CopyButton value={code} label={label} toastLabel={toastLabel} size="sm" variant="ghost" />
      </div>
      <CodeBlock className="max-h-[340px] rounded-none border-0 bg-transparent">{code}</CodeBlock>
    </TabsContent>
  );
}

function WorkbenchFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b px-4 py-3 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function sampleFetchSnippet(method: string, requestUrl: string, body: string | undefined): string {
  const headers = ['    "x-api-key": process.env.DUMMY_API_KEY ?? ""'];
  if (body) {
    headers.push('    "content-type": "application/json"');
  }

  const requestBody = body ? `const requestBody = ${body};\n\n` : "";
  const bodyOption = body ? ",\n  body: JSON.stringify(requestBody)" : "";

  return `${requestBody}const response = await fetch("${requestUrl}", {
  method: "${method}",
  headers: {
${headers.join(",\n")}
  }${bodyOption}
});

if (!response.ok) {
  throw new Error(\`Request failed with \${response.status}\`);
}

const data = await response.json();
console.log(data);`;
}

function samplePythonSnippet(method: string, requestUrl: string, body: string | undefined): string {
  const imports = body ? "import json\nimport os\nimport requests" : "import os\nimport requests";
  const bodyBlock = body ? `\n\npayload = json.loads("""${body}""")` : "";
  const jsonOption = body ? ", json=payload" : "";

  return `${imports}

url = "${requestUrl}"
headers = {
    "x-api-key": os.environ["DUMMY_API_KEY"]${body ? ',\n    "content-type": "application/json"' : ""}
}${bodyBlock}

response = requests.request("${method}", url, headers=headers${jsonOption})
response.raise_for_status()

print(response.json())`;
}

function requestKitSnippet({
  method,
  requestUrl,
  curl,
  fetchSnippet,
  pythonSnippet,
  body,
  responsePreview
}: {
  method: string;
  requestUrl: string;
  curl: string;
  fetchSnippet: string;
  pythonSnippet: string;
  body?: string | undefined;
  responsePreview: string;
}): string {
  return [
    `${method} ${requestUrl}`,
    "",
    "Auth header:",
    "x-api-key: dak_your_key",
    "",
    "cURL:",
    curl,
    "",
    "JavaScript fetch:",
    fetchSnippet,
    "",
    "Python requests:",
    pythonSnippet,
    ...(body ? ["", "Request body:", body] : []),
    "",
    "Expected response:",
    responsePreview
  ].join("\n");
}

function RequestPane({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="min-h-40 border-b p-4 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function ParamsList({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <span className="text-sm text-muted-foreground">None</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {names.map((name) => (
        <Badge key={name} variant="outline">
          {name}
        </Badge>
      ))}
    </div>
  );
}

function SchemaFields({ fields }: { fields: SchemaField[] }) {
  if (fields.length === 0) {
    return <span className="text-sm text-muted-foreground">None</span>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => (
          <TableRow key={field.name}>
            <TableCell className="font-mono text-xs">{field.name}</TableCell>
            <TableCell>
              <span className="font-mono text-xs text-muted-foreground">
                {field.type}
                {field.required ? " *" : ""}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
