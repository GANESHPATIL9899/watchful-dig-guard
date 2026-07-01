import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import http from "http";
import { URL } from "url";
import { alerts as seedAlerts } from "./mock/alerts";
import { kpiSnapshot, trendDaily } from "./mock/dashboard";
import { evidence } from "./mock/evidence";
import { incidents as seedIncidents } from "./mock/incidents";
import { machines as seedMachines } from "./mock/machines";
import { workers } from "./mock/workers";
import { classifyZone, zoneToSeverity } from "./business/risk";
import type { Alert, Incident, KpiSnapshot, Machine, TrendPoint } from "./types";

const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
const REFRESH_MS = Number(process.env.IOT_SIM_REFRESH_MS ?? 3000);

let machines: Machine[] = seedMachines.map((machine) => ({ ...machine, gps: { ...machine.gps } }));
let incidents: Incident[] = [...seedIncidents];
let alerts: Alert[] = [...seedAlerts];
let trend: TrendPoint[] = [...trendDaily];
let workersDetectedToday = kpiSnapshot.workersDetectedToday;

function currentKpis(): KpiSnapshot {
  const now = Date.now();

  // Dynamic Machine Status updates:
  machines.forEach((m) => {
    if (m.status !== "maintenance") {
      const lastActive = m.lastIncidentAt ? new Date(m.lastIncidentAt).getTime() : 0;
      if (now - lastActive > 15000) {
        m.status = "idle";
      } else {
        m.status = "active";
      }
    }
  });

  // Dynamic Alert Status updates:
  alerts.forEach((a) => {
    const ageMs = now - new Date(a.createdAt).getTime();
    if (ageMs > 12000 && a.status === "active") {
      a.status = Math.random() > 0.5 ? "resolved" : "acknowledged";
    }
  });

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

function pushTelemetry(
  machineId: string,
  distanceM: number,
  timestamp?: string,
  workerId?: string,
  workerName?: string,
  imageUrl?: string
): void {
  const machine = machines.find((m) => m.id === machineId) ?? machines[0];
  const worker = workerId 
    ? (workers.find((w) => w.id === workerId) ?? workers[0]) 
    : workers[Math.floor(Math.random() * workers.length)];
  const riskLevel = classifyZone(distanceM);
  const severity = zoneToSeverity(riskLevel);
  const now = timestamp ?? new Date().toISOString();
  const emergencyStop = riskLevel === "emergency";

  machine.speedKph = emergencyStop ? 0 : Math.max(0, Math.round(2 + Math.random() * 7));
  machine.hydraulic = emergencyStop ? "locked" : "engaged";
  machine.status = "active";
  machine.engine = "running";
  machine.healthScore = Math.max(70, Math.min(99, machine.healthScore + (Math.random() > 0.5 ? 1 : -1)));
  machine.lastIncidentAt = now;

  const incident: Incident = {
    id: `INC-LIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    workerId: worker.id,
    workerName: workerName ?? worker.name,
    machineId: machine.id,
    distanceM,
    riskLevel,
    severity,
    alertType: riskLevel === "safe" ? "Worker Detected" : "Blind Spot Breach",
    imageUrl: imageUrl || (incidents.length > 0 ? incidents[Math.floor(Math.random() * incidents.length)].imageUrl : ""),
    actionTaken: emergencyStop ? "Emergency stop engaged - hydraulic lock" : "Audio + visual alert issued",
    emergencyStop,
    resolutionStatus: emergencyStop ? "open" : "investigating",
    location: machine.location,
    gps: machine.gps,
    rootCause: emergencyStop ? "Worker entered swing radius during reverse" : undefined,
  };

  const alert: Alert = {
    id: `ALR-LIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: emergencyStop ? "emergency_stop" : riskLevel === "critical" ? "danger_zone_entry" : "worker_near_machine",
    severity,
    machineId: machine.id,
    workerId: worker.id,
    distanceM,
    status: "active",
    message: `${workerName ?? worker.name} detected ${distanceM.toFixed(1)}m from ${machine.id}`,
    createdAt: now,
  };

  incidents = [incident, ...incidents].slice(0, 24);
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

// Telemetry simulation interval disabled to prevent duplicate/repeated incidents
// setInterval(() => {
//   const machine = machines[Math.floor(Math.random() * machines.length)];
//   const distanceM = Number((0.4 + Math.random() * 7.5).toFixed(2));
//   pushTelemetry(machine.id, distanceM);
// }, REFRESH_MS);
 function startAwsIotClient() {
      const endpoint = process.env.AWS_IOT_ENDPOINT;
      const topic = process.env.AWS_IOT_TOPIC ??
  "excavators/telemetry";

      if (!endpoint) {
        console.warn("⚠️ AWS_IOT_ENDPOINT not set, running in
  local HTTP simulation mode only.");
        return;
      }

      console.log("Connecting to AWS IoT Core MQTT broker...");
      try {
        const certsPath = path.join(process.cwd(), "certs");
        const options = {
          key: fs.readFileSync(path.join(certsPath, "private.
  pem.key")),
          cert: fs.readFileSync(path.join(certsPath,
  "certificate.pem.crt")),
          ca: fs.readFileSync(path.join(certsPath,
  "AmazonRootCA1.pem")),
          clientId: "watchful-dig-guard-backend-" + Math.
  random().toString(16).substring(2, 8),
          rejectUnauthorized: true,
        };

        const client = mqtt.connect(`mqtts://${endpoint}:8883`,
  options);

        client.on("connect", () => {
          console.log("✅ Connected to AWS IoT Core MQTT
  Broker!");
          client.subscribe(topic, (err) => {
            if (err) {
              console.error("❌ Subscription error on topic:",
  topic, err);
            } else {
              console.log("📡 Subscribed to AWS IoT topic:",
  topic);
            }
          });
        });

        client.on("message", (topic, message) => {
          try {
            const payload = JSON.parse(message.toString());
            console.log("📥 Received AWS IoT Message:",
  payload);

            if (payload.machineId && typeof payload.distanceM
  === "number") {
              pushTelemetry(
                payload.machineId,
                payload.distanceM,
                payload.timestamp,
                payload.workerId,
                payload.workerName,
                payload.imageUrl
              );
            }
          } catch (err) {
            console.error("⚠️ Failed to parse message payload
  JSON:", message.toString(), err);
          }
        });

        client.on("error", (err) => {
          console.error("❌ AWS IoT client connection error:",
  err);
        });
      } catch (err: any) {
        console.error("❌ Failed to initialize AWS IoT
  client:", err.message);
      }
    }
// Create a standard Node.js HTTP server to ensure 100% compatibility on Render without Bun
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "", `http://${req.headers.host || "localhost"}`);
  const path = url.pathname;

  // Set standard CORS headers to support API consumption from external origins
  const headers = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  // Response helper
  const sendJson = (data: unknown, status = 200) => {
    res.writeHead(status, headers);
    res.end(JSON.stringify(data));
  };

  const handlePost = (handler: (body: string) => void) => {
    let bodyData = "";
    req.on("data", (chunk) => bodyData += chunk);
    req.on("end", () => {
      try {
        handler(bodyData);
      } catch (err: any) {
        sendJson({ error: `Bad request: ${err.message}` }, 400);
      }
    });
  };

  if (req.method === "POST" && path === "/api/iot/telemetry") {
    handlePost((body) => {
      const data = JSON.parse(body || "{}");
      pushTelemetry(data.machineId ?? machines[0].id, Number(data.distanceM ?? 2));
      sendJson({ ok: true, kpis: currentKpis() });
    });
    return;
  }

  if (req.method === "POST" && path === "/api/telemetry/csv") {
    handlePost((csvText) => {
      const lines = csvText.split(/\r?\n/);
      let parsedCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        if (i === 0 && (line.toLowerCase().includes("machine") || line.toLowerCase().includes("distance"))) {
          continue;
        }

        const columns = line.split(",");
        if (columns.length >= 2) {
          const machineId = columns[0].trim();
          const distanceM = Number(columns[1].trim());

          if (machineId && !isNaN(distanceM)) {
            const timestamp = columns[2] ? columns[2].trim() : new Date().toISOString();
            const workerName = columns[3] ? columns[3].trim() : undefined;
            const workerId = columns[4] ? columns[4].trim() : undefined;
            const imageUrl = columns[5] ? columns[5].trim() : undefined;

            pushTelemetry(machineId, distanceM, timestamp, workerId, workerName, imageUrl);
            parsedCount++;
          }
        }
      }
      sendJson({ ok: true, message: `Processed ${parsedCount} rows from CSV`, kpis: currentKpis() });
    });
    return;
  }

  if (req.method !== "GET") {
    sendJson({ error: "Not found" }, 404);
    return;
  }

  if (path === "/api/health") return sendJson({ ok: true, refreshMs: REFRESH_MS });
  if (path === "/api/workers") return sendJson(workers);
  if (path.startsWith("/api/workers/")) return sendJson(workers.find((w) => w.id === path.split("/").pop()));
  if (path === "/api/machines") return sendJson(machines);
  if (path.startsWith("/api/machines/")) return sendJson(machines.find((m) => m.id === path.split("/").pop()));
  if (path === "/api/incidents") return sendJson(incidents);
  if (path.startsWith("/api/incidents/")) return sendJson(incidents.find((i) => i.id === path.split("/").pop()));
  if (path === "/api/alerts") return sendJson(alerts);
  if (path.startsWith("/api/alerts/")) return sendJson(alerts.find((a) => a.id === path.split("/").pop()));
  
  if (path === "/api/evidence") {
    const updatedEvidence = incidents.map((inc, i) => ({
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
    return sendJson(updatedEvidence);
  
  }
  
  if (path.startsWith("/api/evidence/")) return sendJson(evidence.find((e) => e.id === path.split("/").pop()));
  if (path === "/api/dashboard/kpis") return sendJson(currentKpis());
  if (path === "/api/dashboard/trend") return sendJson(trend);

  sendJson({ error: "Not found" }, 404);
});

server.listen(PORT, () => {
  startAwsIotClient();
  console.log(`Demo IoT API running at http://127.0.0.1:${PORT}/api`);
  console.log(`Generating dummy telemetry every ${REFRESH_MS}ms`);
});
