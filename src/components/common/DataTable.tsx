import { cn } from "@/lib/utils";

interface Props<T> {
  columns: { key: keyof T | string; header: string; render?: (row: T) => React.ReactNode; className?: string }[];
  data: T[];
  onRowClick?: (row: T) => void;
  empty?: string;
}

export function DataTable<T extends { id: string }>({ columns, data, onRowClick, empty = "No records" }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  className={cn("px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", c.className)}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  {empty}
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-t border-border transition-colors",
                  onRowClick && "cursor-pointer hover:bg-accent/40",
                )}
              >
                {columns.map((c) => (
                  <td key={String(c.key)} className={cn("px-4 py-2.5 align-middle text-foreground", c.className)}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key as string] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
