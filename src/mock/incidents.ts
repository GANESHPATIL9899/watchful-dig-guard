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
  "/images/extracted_image_1.jpg",
  "/images/extracted_image_2.jpg",
  "/images/extracted_image_3.jpg",
  "/images/extracted_image_4.jpg",
  "/images/extracted_image_5.jpg",
  "/images/extracted_image_6.jpg",
  "/images/extracted_image_7.jpg",
  "/images/extracted_image_8.jpg",
  "/images/extracted_image_9.jpg",
  "/images/extracted_image_10.jpg",
  "/images/extracted_image_11.jpg",
  "/images/extracted_image_12.jpg",
  "/images/extracted_image_13.jpg",
  "/images/extracted_image_14.jpg",
  "/images/extracted_image_15.jpg",
  "/images/extracted_image_16.jpg",
  "/images/extracted_image_17.jpg",
  "/images/extracted_image_18.jpg",
  "/images/extracted_image_19.jpg",
  "/images/extracted_image_20.jpg",
  "/images/extracted_image_21.jpg",
  "/images/extracted_image_22.jpg",
  "/images/extracted_image_23.jpg",
  "/images/extracted_image_24.jpg"
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
