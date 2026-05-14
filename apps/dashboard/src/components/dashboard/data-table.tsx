import Link from "next/link";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  linked?: boolean;
};

export function DataTable<T>({
  rows,
  columns,
  getRowHref,
  empty,
  className
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowHref?: (row: T) => string;
  empty: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32">
                <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
                    <Inbox className="h-4 w-4" />
                  </div>
                  <div className="text-sm">{empty}</div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => {
              const href = getRowHref?.(row);
              return (
                <TableRow key={rowIndex} className={href ? "group cursor-pointer hover:bg-accent/70" : undefined}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {href && column.linked !== false ? (
                        <Link
                          href={href}
                          className="block -mx-3 -my-3 px-3 py-3 text-inherit outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {column.cell(row)}
                        </Link>
                      ) : (
                        column.cell(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
