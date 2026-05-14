"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Braces,
  Database,
  KeyRound,
  Layers3,
  LogOut,
  Menu,
  Plug,
  Server
} from "lucide-react";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

type NavCounts = {
  apps: number;
  endpoints: number;
  responses: number;
  keys: number;
  usage: number;
};

const navItems: Array<{
  href: string;
  label: string;
  icon: ReactNode;
  countKey?: keyof NavCounts;
}> = [
  { href: "/dashboard", label: "Overview", icon: <Layers3 className="h-4 w-4" /> },
  { href: "/dashboard/apps", label: "Apps", icon: <Server className="h-4 w-4" />, countKey: "apps" },
  { href: "/dashboard/apis", label: "APIs", icon: <Plug className="h-4 w-4" />, countKey: "endpoints" },
  { href: "/dashboard/responses", label: "Responses", icon: <Braces className="h-4 w-4" />, countKey: "responses" },
  { href: "/dashboard/access", label: "Access", icon: <KeyRound className="h-4 w-4" />, countKey: "keys" },
  { href: "/dashboard/usage", label: "Usage", icon: <Activity className="h-4 w-4" />, countKey: "usage" }
];

export function DashboardNav({ username, counts }: { username: string; counts: NavCounts }) {
  const pathname = usePathname();

  return (
    <>
      <div className="border-b p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Database className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">API Console</div>
            <div className="text-xs text-muted-foreground">Registry operations</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {item.countKey ? <span className="font-mono text-xs">{counts[item.countKey]}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center justify-between rounded-md border bg-background p-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Signed in</div>
            <div className="mt-1 truncate text-sm font-medium">{username}</div>
          </div>
          <Badge variant="outline">Admin</Badge>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary" className="flex-1">
                Admin
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="truncate text-sm font-medium">{username}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/access">Create or revoke keys</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/usage">Check usage</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

export function MobileDashboardNav({ counts }: { counts: NavCounts }) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start gap-2">
            <Menu className="h-4 w-4" />
            Browse console
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px]">
          <SheetHeader>
            <SheetTitle>API Console</SheetTitle>
            <SheetDescription>Jump between apps, APIs, responses, access, and usage.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <SheetClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    {item.countKey ? <span className="font-mono text-xs">{counts[item.countKey]}</span> : null}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
