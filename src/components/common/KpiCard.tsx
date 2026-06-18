import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: { value: string; positive?: boolean };
  tone?: "default" | "safe" | "warning" | "critical" | "info";
  hint?: string;
}

const TONE_RING: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-primary bg-primary/10",
  safe: "text-safe bg-safe/15",
  warning: "text-warning-foreground bg-warning/25",
  critical: "text-critical bg-critical/15",
  info: "text-info bg-info/15",
};

export function KpiCard({ label, value, icon: Icon, delta, tone = "default", hint }: Props) {
  return (
    <div className="kpi-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-md", TONE_RING[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
        {delta && (
          <span className={cn("text-xs font-medium", delta.positive ? "text-safe" : "text-critical")}>
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
