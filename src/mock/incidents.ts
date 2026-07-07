import type { Incident } from "@/types";
import { workers } from "./workers";
import { machines } from "./machines";
import { classifyZone, zoneToSeverity } from "@/business/risk";

const ACTIONS = [
  "Audio + visual alert issued",
  "Operator notified via dashboard",
  "Machine swing halted",
  "Emergency stop engaged — hydraulic lock",
  "Worker escorted out of zone",
];

const ALERT_TYPES = ["Worker Near Machine", "Danger Zone Entry", "Blind Spot Breach", "Reverse Path Obstruction"];
const RESOLUTIONS: Incident["resolutionStatus"][] = ["open", "investigating", "resolved"];

const REAL_IMAGES = [
  "/images/02e78718-8fc6-42fb-87cb-184ca9a40038.jpeg",
  "/images/3c7d313c-3bc9-48f5-ab59-9a7d90d120ed (1).jpeg",
  "/images/3c7d313c-3bc9-48f5-ab59-9a7d90d120ed.jpeg",
  "/images/e38eb590-5b5c-482b-adec-9349471c3f74.jpeg",
  "/images/431f5256-0b8b-45fa-90b3-388a11e6221c.jpeg",
  "/images/a50bd700-a1f5-46ef-a900-5141af107163.jpeg"
];

export const incidents: Incident[] = Array.from({ length: REAL_IMAGES.length }, (_, i) => {
  const w = workers[i % workers.length];
  const m = machines[i % machines.length];
  const distanceM = Math.max(0.4, +(Math.abs(Math.sin(i * 1.7)) * 4.5).toFixed(2));
  const zone = classifyZone(distanceM);
  const ts = new Date(Date.now() - i * 3600 * 1000 * 0.7).toISOString();
  return {
    id: `INC-${String(5001 + i)}`,
    timestamp: ts,
    workerId: w.id,
    workerName: w.name,
    machineId: m.id,
    distanceM,
    riskLevel: zone,
    severity: zoneToSeverity(zone),
    alertType: ALERT_TYPES[i % ALERT_TYPES.length],
    imageUrl: REAL_IMAGES[i % REAL_IMAGES.length],
    actionTaken: ACTIONS[Math.min(ACTIONS.length - 1, ["safe", "warning", "critical", "emergency"].indexOf(zone) + 1)],
    emergencyStop: zone === "emergency",
    resolutionStatus: RESOLUTIONS[i % RESOLUTIONS.length],
    location: m.location,
    gps: m.gps,
    rootCause: zone === "emergency" ? "Worker entered swing radius during reverse" : undefined,
    supervisorRemarks: i % 5 === 0 ? "Reviewed; safety briefing scheduled" : undefined,
  };
});
