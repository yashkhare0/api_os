"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Braces,
  Gauge,
  KeyRound,
  Search,
  Server,
  TerminalSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { AdminSummary, ApiEndpoint } from "@/lib/admin-api";
import { endpointHref } from "./format";

type CommandItemValue = {
  label: string;
  href: string;
  icon: ReactNode;
  shortcut?: string;
};

export function DashboardCommandMenu({ summary }: { summary?: AdminSummary | undefined }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const endpointItems = useMemo(() => buildEndpointItems(summary?.registry.endpoints ?? []), [summary]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" onClick={() => setOpen(true)} className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Command</span>
            <span className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
              Ctrl K
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Jump around the API console</TooltipContent>
      </Tooltip>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Find an app, endpoint, or action..." />
        <CommandList>
          <CommandEmpty>No route found. The console stayed tidy.</CommandEmpty>
          <CommandGroup heading="Actions">
            {staticCommands.map((item) => (
              <CommandRow key={item.href} item={item} onSelect={() => goTo(item.href)} />
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Apps">
            {(summary?.registry.apps ?? []).map((app) => (
              <CommandRow
                key={app.id}
                item={{
                  label: app.name,
                  href: `/dashboard/apps/${encodeURIComponent(app.slug)}`,
                  icon: <Server className="h-4 w-4" />,
                  shortcut: app.status === "active" ? "Live" : "Off"
                }}
                onSelect={() => goTo(`/dashboard/apps/${encodeURIComponent(app.slug)}`)}
              />
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="APIs">
            {endpointItems.map((item) => (
              <CommandRow key={item.href} item={item} onSelect={() => goTo(item.href)} />
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function CommandRow({ item, onSelect }: { item: CommandItemValue; onSelect: () => void }) {
  return (
    <CommandItem value={`${item.label} ${item.href}`} onSelect={onSelect}>
      {item.icon}
      <span className="truncate">{item.label}</span>
      {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
    </CommandItem>
  );
}

function buildEndpointItems(endpoints: ApiEndpoint[]): CommandItemValue[] {
  return endpoints.slice(0, 24).map((endpoint) => ({
    label: `${endpoint.method} ${endpoint.path}`,
    href: endpointHref(endpoint),
    icon: <TerminalSquare className="h-4 w-4" />,
    shortcut: endpoint.appSlug
  }));
}

const staticCommands: CommandItemValue[] = [
  {
    label: "Create API key",
    href: "/dashboard/access",
    icon: <KeyRound className="h-4 w-4" />,
    shortcut: "Access"
  },
  {
    label: "Add response sample",
    href: "/dashboard/responses",
    icon: <Braces className="h-4 w-4" />,
    shortcut: "JSON"
  },
  {
    label: "Review usage",
    href: "/dashboard/usage",
    icon: <Gauge className="h-4 w-4" />,
    shortcut: "Traffic"
  }
];
