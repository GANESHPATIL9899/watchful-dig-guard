import type { ZoneStatus, Severity } from "@/types";

export const ZONE_LABEL: Record<ZoneStatus, string> = {
  safe: "Safe Zone",
  warning: "Warning Zone",
  critical: "Danger Zone",
  emergency: "Danger Zone (Stop)",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const ZONE_THRESHOLDS_M = {
  safe: 5.0,     // > 5m -> Safe Zone
  warning: 3.0,  // 3m - 5m -> Warning Zone
  critical: 1.5, // 1.5m - 3m -> Danger Zone
  // < 1.5m -> Danger Zone (Stop)
};

export const ROUTES = {
  login: "/login",
  dashboard: "/",
  evidence: "/evidence",
  workers: "/workers",
  worker: (id: string) => `/workers/${id}`,
  incidents: "/incidents",
  alerts: "/alerts",
  analytics: "/analytics",
  machines: "/machines",
  machine: (id: string) => `/machines/${id}`,
};
