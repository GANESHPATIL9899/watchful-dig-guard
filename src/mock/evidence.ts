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
}).filter(e => e.id !== "EVD-9002" && e.id !== "EVD-9004");
