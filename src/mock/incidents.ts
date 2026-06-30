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

// High-quality, real-time safety images representing actual workers and machinery on site
const REAL_IMAGES = [
  "/images/extracted_image_1.png",
  "/images/extracted_image_2.png",
  "/images/extracted_image_3.png",
  "/images/extracted_image_4.png",
  "/images/extracted_image_5.png",
  "/images/extracted_image_6.png",
  "/images/extracted_image_7.png",
  "/images/extracted_image_8.png",
  "/images/extracted_image_9.png",
  "/images/extracted_image_10.png",
  "/images/extracted_image_11.png",
  "/images/extracted_image_12.png",
  "/images/extracted_image_13.png",
  "/images/extracted_image_14.png",
  "/images/extracted_image_15.png",
  "/images/extracted_image_16.png",
  "/images/extracted_image_17.png",
  "/images/extracted_image_18.png",
  "/images/extracted_image_19.png",
  "/images/extracted_image_20.png",
  "/images/extracted_image_21.png",
  "/images/extracted_image_22.png",
  "/images/extracted_image_23.png",
  "/images/extracted_image_24.png"
];

export const incidents: Incident[] = Array.from({ length: REAL_IMAGES.length }, (_, i) => {
  const w = workers[i % workers.length];
  const m = machines[i % machines.length];
  const distanceM = Math.max(0.4, +(Math.abs(Math.sin(i * 1.7)) * 10).toFixed(2));
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
