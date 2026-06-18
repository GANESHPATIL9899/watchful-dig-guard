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

function captureSvg(distanceM: number, zone: string): string {
  const tint = zone === "emergency" ? "#7a1414" : zone === "critical" ? "#b54708" : zone === "warning" ? "#a16207" : "#0f3a52";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'>
    <defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='${tint}'/><stop offset='1' stop-color='#0a0f1c'/></linearGradient></defs>
    <rect width='320' height='200' fill='url(#g)'/>
    <g stroke='rgba(255,255,255,0.08)'>
      ${Array.from({ length: 8 }, (_, i) => `<line x1='0' y1='${i * 25}' x2='320' y2='${i * 25}'/>`).join("")}
      ${Array.from({ length: 10 }, (_, i) => `<line y1='0' x1='${i * 32}' y2='200' x2='${i * 32}'/>`).join("")}
    </g>
    <rect x='110' y='70' width='60' height='110' fill='none' stroke='#22d3ee' stroke-width='2' stroke-dasharray='4 3'/>
    <circle cx='140' cy='110' r='14' fill='#fbbf24' opacity='0.9'/>
    <rect x='125' y='124' width='30' height='40' rx='4' fill='#fb923c'/>
    <text x='12' y='22' font-family='monospace' font-size='12' fill='#a7f3d0'>REAR CAM • IR</text>
    <text x='12' y='190' font-family='monospace' font-size='11' fill='#fde68a'>DIST ${distanceM.toFixed(1)}m</text>
    <text x='220' y='22' font-family='monospace' font-size='11' fill='#fda4af'>${zone.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const incidents: Incident[] = Array.from({ length: 64 }, (_, i) => {
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
    imageUrl: captureSvg(distanceM, zone),
    actionTaken: ACTIONS[Math.min(ACTIONS.length - 1, ["safe", "warning", "critical", "emergency"].indexOf(zone) + 1)],
    emergencyStop: zone === "emergency",
    resolutionStatus: RESOLUTIONS[i % RESOLUTIONS.length],
    location: m.location,
    gps: m.gps,
    rootCause: zone === "emergency" ? "Worker entered swing radius during reverse" : undefined,
    supervisorRemarks: i % 5 === 0 ? "Reviewed; safety briefing scheduled" : undefined,
  };
});
