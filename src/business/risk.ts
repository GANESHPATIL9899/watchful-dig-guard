import { ZONE_THRESHOLDS_M } from "@/constants";
import type { Severity, ZoneStatus } from "@/types";

export function classifyZone(distanceM: number): ZoneStatus {
  if (distanceM >= ZONE_THRESHOLDS_M.safe) return "safe";
  if (distanceM >= ZONE_THRESHOLDS_M.warning) return "warning";
  if (distanceM >= ZONE_THRESHOLDS_M.critical) return "critical";
  return "emergency";
}

export function zoneToSeverity(zone: ZoneStatus): Severity {
  return zone === "safe"
    ? "low"
    : zone === "warning"
      ? "medium"
      : zone === "critical"
        ? "high"
        : "critical";
}

export function riskScore(distanceM: number, confidence = 0.95): number {
  // 0–100; closer + higher confidence => higher score
  const proximity = Math.max(0, 1 - distanceM / 10);
  return Math.round(proximity * confidence * 100);
}

export function recommendedAction(zone: ZoneStatus): string {
  switch (zone) {
    case "safe":
      return "Continue monitoring";
    case "warning":
      return "Reduce machine speed, alert operator";
    case "critical":
      return "Halt swing motion, sound buzzer";
    case "emergency":
      return "Engage hydraulic lock — emergency stop";
  }
}

export function formatDistance(m: number): string {
  if (m < 1) return `${Math.round(m * 100)} cm`;
  return `${m.toFixed(1)} m`;
}
