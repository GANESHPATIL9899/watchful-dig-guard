import type { Machine } from "@/types";

const TYPES = ["CAT 320 Excavator", "Komatsu PC210", "JCB JS220", "Hyundai R220", "Volvo EC210"];
const OPERATORS = ["Vijay Singh", "Rohit Verma", "Kiran Patel", "Suresh Nair", "Anand Iyer", "Naveen Joshi", "Mahesh Gupta", "Tarun Mehta", "Sandeep Yadav", "Lokesh Reddy", "Bhavesh Shah", "Yash Kapoor"];
const LOCS = ["Sector 4 — Excavation Pit", "Sector 7 — Trenching", "Sector 2 — Foundation", "Sector 9 — Loading Bay", "Sector 1 — Backfill"];

export const machines: Machine[] = Array.from({ length: 12 }, (_, i) => {
  const id = `EX-${String(2001 + i)}`;
  const healthScore = 70 + ((i * 13) % 30);
  const status = i % 11 === 0 ? "maintenance" : i % 7 === 0 ? "idle" : "active";
  return {
    id,
    type: TYPES[i % TYPES.length],
    operator: OPERATORS[i % OPERATORS.length],
    location: LOCS[i % LOCS.length],
    status,
    speedKph: status === "active" ? Math.round((i * 1.7) % 8) : 0,
    hydraulic: i % 9 === 0 ? "locked" : i % 13 === 0 ? "fault" : "engaged",
    engine: status === "maintenance" ? "stopped" : "running",
    healthScore,
    gps: { lat: 19.076 + i * 0.002, lng: 72.877 + i * 0.0015 },
    cameraStatus: i % 8 === 0 ? "offline" : i % 5 === 0 ? "degraded" : "online",
    lidarStatus: i % 9 === 0 ? "degraded" : "online",
    canBusStatus: i % 12 === 0 ? "offline" : "online",
    lastIncidentAt: new Date(Date.now() - (i + 1) * 3600 * 1000 * (i % 5 + 1)).toISOString(),
  };
});
