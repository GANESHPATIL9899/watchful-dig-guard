import type { Alert } from "@/types";
import { incidents } from "./incidents";

const TYPE_BY_SEV = (sev: string): Alert["type"] =>
  sev === "critical" ? "emergency_stop" : sev === "high" ? "danger_zone_entry" : "worker_near_machine";

export const alerts: Alert[] = incidents.slice(0, 22).map((inc, i) => ({
  id: `ALR-${String(7001 + i)}`,
  type: i % 11 === 0 ? "camera_offline" : i % 13 === 0 ? "lidar_offline" : TYPE_BY_SEV(inc.severity),
  severity: inc.severity,
  machineId: inc.machineId,
  workerId: inc.workerId,
  distanceM: inc.distanceM,
  status: i < 8 ? "active" : i < 14 ? "acknowledged" : i < 18 ? "escalated" : "resolved",
  message:
    i % 11 === 0
      ? `Camera offline on ${inc.machineId}`
      : i % 13 === 0
        ? `LiDAR signal lost on ${inc.machineId}`
        : `${inc.workerName} detected ${inc.distanceM.toFixed(1)}m from ${inc.machineId}`,
  createdAt: inc.timestamp,
}));
