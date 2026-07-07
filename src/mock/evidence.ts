import type { EvidenceImage } from "@/types";
import { incidents } from "./incidents";

export const evidence: EvidenceImage[] = incidents.map((inc, i) => {
  const id = `EVD-${String(9001 + i)}`;
  return {
    id,
    imageUrl: inc.imageUrl,
    capturedAt: inc.timestamp,
    workerId: inc.workerId,
    machineId: inc.machineId,
    distanceM: inc.distanceM,
    alertType: inc.alertType,
    confidence: 0.78 + ((i * 7) % 22) / 100,
    emergencyStop: inc.emergencyStop,
    notes: inc.supervisorRemarks,
  };
}).filter(e => 
  !e.imageUrl.includes("3c7d313c-3bc9-48f5-ab59-9a7d90d120ed (1).jpeg") &&
  !e.imageUrl.includes("e38eb590-5b5c-482b-adec-9349471c3f74.jpeg") &&
  !e.imageUrl.includes("133e2b71-fd40-4552-9d32-c2c587e95ea1.jpeg") &&
  !e.imageUrl.includes("4247bd78-7e89-4ca5-a730-7884ccb32342.jpeg")
);
