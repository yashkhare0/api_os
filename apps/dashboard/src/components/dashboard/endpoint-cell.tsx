export function EndpointCell({ method, path }: { method: string; path: string }) {
  return (
    <div className="truncate font-mono text-xs" title={`Open ${method} ${path}`}>
      <span className="font-semibold text-foreground">{method}</span> {path}
    </div>
  );
}
