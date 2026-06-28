import type { ZoneStatus, Severity } from "@/types";

export const ZONE_LABEL: Record<ZoneStatus, string> = {
  safe: "Safe",
  warning: "Warning",
  critical: "Critical",
  emergency: "Emergency Stop",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const ZONE_THRESHOLDS_M = {
  safe: 8, // > 8m
  warning: 5, // 5-8m
  critical: 2.5, // 2.5-5m
  // < 2.5m → emergency
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
