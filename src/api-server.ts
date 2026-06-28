import { alerts as seedAlerts } from "./mock/alerts";
import { kpiSnapshot, trendDaily } from "./mock/dashboard";
import { evidence } from "./mock/evidence";
import { incidents as seedIncidents } from "./mock/incidents";
import { machines as seedMachines } from "./mock/machines";
import { workers } from "./mock/workers";
import { classifyZone, zoneToSeverity } from "./business/risk";
import type { Alert, Incident, KpiSnapshot, Machine, TrendPoint } from "./types";

declare const Bun: {
  serve(options: { port: number; fetch(req: Request): Response | Promise<Response> }): unknown;
};

const PORT = Number(process.env.API_PORT ?? 4000);
const REFRESH_MS = Number(process.env.IOT_SIM_REFRESH_MS ?? 3000);

let machines: Machine[] = seedMachines.map((machine) => ({ ...machine, gps: { ...machine.gps } }));
let incidents: Incident[] = [...seedIncidents];
let alerts: Alert[] = [...seedAlerts];
let trend: TrendPoint[] = [...trendDaily];
let workersDetectedToday = kpiSnapshot.workersDetectedToday;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      "content-type": "application/json",
    },
  });
}

function notFound(): Response {
  return json({ error: "Not found" }, 404);
}

function currentKpis(): KpiSnapshot {
  return {
    machinesActive: machines.filter((m) => m.status === "active").length,
    workersDetectedToday,
    activeAlerts: alerts.filter((a) => a.status === "active").length,
    emergencyStops: incidents.filter((i) => i.emergencyStop).length,
    nearMissIncidents: incidents.filter((i) => i.riskLevel === "critical" || i.riskLevel === "emergency").length,
    complianceScore: Math.max(88, Math.min(99, kpiSnapshot.complianceScore + Math.round(Math.sin(Date.now() / 9000) * 2))),
    camerasOnline: machines.filter((m) => m.cameraStatus === "online").length,
    systemHealth: Math.max(82, Math.min(99, Math.round(machines.reduce((sum, m) => sum + m.healthScore, 0) / machines.length))),
  };
}

function pushTelemetry(machineId: string, distanceM: number): void {
  const machine = machines.find((m) => m.id === machineId) ?? machines[0];
  const worker = workers[Math.floor(Math.random() * workers.length)];
  const riskLevel = classifyZone(distanceM);
  const severity = zoneToSeverity(riskLevel);
  const now = new Date().toISOString();
  const emergencyStop = riskLevel === "emergency";

  machine.speedKph = emergencyStop ? 0 : Math.max(0, Math.round(2 + Math.random() * 7));
  machine.hydraulic = emergencyStop ? "locked" : "engaged";
  machine.status = "active";
  machine.engine = "running";
  machine.healthScore = Math.max(70, Math.min(99, machine.healthScore + (Math.random() > 0.5 ? 1 : -1)));
  machine.lastIncidentAt = now;

  const incident: Incident = {
    id: `INC-LIVE-${Date.now()}`,
    timestamp: now,
    workerId: worker.id,
    workerName: worker.name,
    machineId: machine.id,
    distanceM,
    riskLevel,
    severity,
    alertType: riskLevel === "safe" ? "Worker Detected" : "Blind Spot Breach",
    imageUrl: incidents[0]?.imageUrl ?? "",
    actionTaken: emergencyStop ? "Emergency stop engaged - hydraulic lock" : "Audio + visual alert issued",
    emergencyStop,
    resolutionStatus: emergencyStop ? "open" : "investigating",
    location: machine.location,
    gps: machine.gps,
    rootCause: emergencyStop ? "Worker entered swing radius during reverse" : undefined,
  };

  const alert: Alert = {
    id: `ALR-LIVE-${Date.now()}`,
    type: emergencyStop ? "emergency_stop" : riskLevel === "critical" ? "danger_zone_entry" : "worker_near_machine",
    severity,
    machineId: machine.id,
    workerId: worker.id,
    distanceM,
    status: "active",
    message: `${worker.name} detected ${distanceM.toFixed(1)}m from ${machine.id}`,
    createdAt: now,
  };

  incidents = [incident, ...incidents].slice(0, 80);
  alerts = [alert, ...alerts].slice(0, 40);
  workersDetectedToday += 1;

  const latest = trend.at(-1);
  if (latest) {
    trend = [
      ...trend.slice(0, -1),
      {
        ...latest,
        alerts: latest.alerts + 1,
        incidents: latest.incidents + (riskLevel === "safe" ? 0 : 1),
        emergencyStops: latest.emergencyStops + (emergencyStop ? 1 : 0),
      },
    ];
  }
}

setInterval(() => {
  const machine = machines[Math.floor(Math.random() * machines.length)];
  const distanceM = Number((0.4 + Math.random() * 7.5).toFixed(2));
  pushTelemetry(machine.id, distanceM);
}, REFRESH_MS);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === "OPTIONS") return json({});

    if (req.method === "POST" && path === "/api/iot/telemetry") {
      const body = (await req.json()) as { machineId?: string; distanceM?: number };
      pushTelemetry(body.machineId ?? machines[0].id, Number(body.distanceM ?? 2));
      return json({ ok: true, kpis: currentKpis() });
    }

    if (req.method !== "GET") return notFound();

    if (path === "/api/health") return json({ ok: true, refreshMs: REFRESH_MS });
    if (path === "/api/workers") return json(workers);
    if (path.startsWith("/api/workers/")) return json(workers.find((w) => w.id === path.split("/").pop()));
    if (path === "/api/machines") return json(machines);
    if (path.startsWith("/api/machines/")) return json(machines.find((m) => m.id === path.split("/").pop()));
    if (path === "/api/incidents") return json(incidents);
    if (path.startsWith("/api/incidents/")) return json(incidents.find((i) => i.id === path.split("/").pop()));
    if (path === "/api/alerts") return json(alerts);
    if (path.startsWith("/api/alerts/")) return json(alerts.find((a) => a.id === path.split("/").pop()));
    if (path === "/api/evidence") return json(evidence);
    if (path.startsWith("/api/evidence/")) return json(evidence.find((e) => e.id === path.split("/").pop()));
    if (path === "/api/dashboard/kpis") return json(currentKpis());
    if (path === "/api/dashboard/trend") return json(trend);

    return notFound();
  },
});

console.log(`Demo IoT API running at http://127.0.0.1:${PORT}/api`);
console.log(`Generating dummy telemetry every ${REFRESH_MS}ms`);
