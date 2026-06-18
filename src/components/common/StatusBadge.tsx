import { cn } from "@/lib/utils";
import type { ZoneStatus, Severity, AlertStatus, SensorStatus } from "@/types";

type Tone = "safe" | "warning" | "critical" | "info" | "muted";
const TONE_CLASS: Record<Tone, string> = {
  safe: "bg-safe/15 text-safe border-safe/30",
  warning: "bg-warning/20 text-warning-foreground border-warning/40",
  critical: "bg-critical/15 text-critical border-critical/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-muted text-muted-foreground border-border",
};

const ZONE_TONE: Record<ZoneStatus, Tone> = {
  safe: "safe",
  warning: "warning",
  critical: "critical",
  emergency: "critical",
};
const SEV_TONE: Record<Severity, Tone> = {
  low: "safe",
  medium: "warning",
  high: "critical",
  critical: "critical",
};
const ALERT_TONE: Record<AlertStatus, Tone> = {
  active: "critical",
  acknowledged: "info",
  escalated: "warning",
  resolved: "safe",
};
const SENSOR_TONE: Record<SensorStatus, Tone> = {
  online: "safe",
  degraded: "warning",
  offline: "critical",
};

interface Props {
  tone?: Tone;
  zone?: ZoneStatus;
  severity?: Severity;
  alertStatus?: AlertStatus;
  sensor?: SensorStatus;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ tone, zone, severity, alertStatus, sensor, children, className, dot }: Props) {
  const resolved: Tone =
    tone ??
    (zone ? ZONE_TONE[zone] : severity ? SEV_TONE[severity] : alertStatus ? ALERT_TONE[alertStatus] : sensor ? SENSOR_TONE[sensor] : "muted");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        TONE_CLASS[resolved],
        className,
      )}
    >
      {dot && <span className={cn("status-dot", resolved === "safe" ? "bg-safe" : resolved === "warning" ? "bg-warning" : resolved === "critical" ? "bg-critical" : resolved === "info" ? "bg-info" : "bg-muted-foreground")} />}
      {children}
    </span>
  );
}
