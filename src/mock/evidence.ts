import type { EvidenceImage } from "@/types";
import { incidents } from "./incidents";

export const evidence: EvidenceImage[] = incidents.map((inc, i) => ({
  id: `EVD-${String(9001 + i)}`,
  imageUrl: inc.imageUrl,
  capturedAt: inc.timestamp,
  workerId: inc.workerId,
  machineId: inc.machineId,
  distanceM: inc.distanceM,
  alertType: inc.alertType,
  confidence: 0.78 + ((i * 7) % 22) / 100,
  emergencyStop: inc.emergencyStop,
  notes: inc.supervisorRemarks,
}));
