import type { KpiSnapshot, TrendPoint } from "@/types";
import { machines } from "./machines";
import { workers } from "./workers";
import { incidents } from "./incidents";
import { alerts } from "./alerts";

export const kpiSnapshot: KpiSnapshot = {
  machinesActive: machines.filter((m) => m.status === "active").length,
  workersDetectedToday: 248,
  activeAlerts: alerts.filter((a) => a.status === "active").length,
  emergencyStops: incidents.filter((i) => i.emergencyStop).length,
  nearMissIncidents: incidents.filter((i) => i.riskLevel === "critical").length,
  complianceScore: 96,
  camerasOnline: machines.filter((m) => m.cameraStatus === "online").length,
  systemHealth: 94,
};

void workers;

export const trendDaily: TrendPoint[] = Array.from({ length: 14 }, (_, i) => {
  const day = new Date(Date.now() - (13 - i) * 86400000);
  return {
    label: day.toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
    alerts: 8 + Math.round(Math.abs(Math.sin(i)) * 14),
    incidents: 2 + Math.round(Math.abs(Math.cos(i * 1.3)) * 6),
    emergencyStops: i % 5 === 0 ? 1 : 0,
    compliance: 90 + Math.round(Math.abs(Math.sin(i * 0.5)) * 9),
  };
});
