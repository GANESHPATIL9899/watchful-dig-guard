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

const USERS_FILE = path.join(process.cwd(), "users.json");

function loadUsers(): Record<string, any> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading users.json:", err);
  }
  return {
    "supervisor@site.local": {
      password: "demo1234",
      role: "supervisor",
      name: "Supervisor"
    }
  };
}

function saveUsers(users: Record<string, any>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users.json:", err);
  }
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return null;
}


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
  imageUrl?: string,
  nodeId?: string
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
    imageUrl: (imageUrl && imageUrl !== "NULL" && imageUrl !== "none" && imageUrl !== "undefined")
      ? imageUrl
      : (incidents.length > 0 ? incidents[Math.floor(Math.random() * incidents.length)].imageUrl : "/images/extracted_image_1.jpg"),
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
    nodeId,
    workerId: worker.id,
    distanceM,
    status: "active",
    message: `${workerName ?? worker.name} detected ${distanceM.toFixed(1)}m from ${machine.id} (${nodeId ? nodeId.replace("node-", "Node ") : "Node 1"})`,
    createdAt: now,
  };

  incidents = [incident, ...incidents].slice(0, 10);
  alerts = [alert, ...alerts].slice(0, 5);
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
function healPemString(rawStr: string, type: "key" | "cert"): string {
  if (!rawStr) return "";
  
  let base64 = rawStr
    .replace(/-----BEGIN [A-Z0-9 ]+-----/gi, "")
    .replace(/-----END [A-Z0-9 ]+-----/gi, "")
    .replace(/\\n/g, "")
    .replace(/[\r\n\s\-]+/g, "");

  const lines = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.substring(i, i + 64));
  }

  const header = type === "key" 
    ? "-----BEGIN RSA PRIVATE KEY-----" 
    : "-----BEGIN CERTIFICATE-----";
  const footer = type === "key" 
    ? "-----END RSA PRIVATE KEY-----" 
    : "-----END CERTIFICATE-----";

  return `${header}\n${lines.join("\n")}\n${footer}`;
}

function startAwsIotClient() {
  const endpoint = process.env.AWS_IOT_ENDPOINT;
  const topic = process.env.AWS_IOT_TOPIC ?? "machine/05/#";

  if (!endpoint) {
    console.warn("⚠️ AWS_IOT_ENDPOINT not set, running in local HTTP simulation mode only.");
    return;
  }

  console.log("Connecting to AWS IoT Core MQTT broker...");
  try {
    const certsPath = path.join(process.cwd(), "certs");
    
    // Support loading certificate contents directly from environment variables (highly recommended for Render/Cloud hosts)
    const rawKey = process.env.AWS_PRIVATE_KEY;
    let keyContent: string | Buffer = "";
    if (rawKey) {
      console.log(`ℹ️ AWS_PRIVATE_KEY env var detected (length: ${rawKey.length}). Healing PEM...`);
      keyContent = healPemString(rawKey, "key");
    } else {
      try {
        keyContent = fs.readFileSync(path.join(certsPath, "private.pem.key"));
      } catch (err: any) {
        console.warn("⚠️ Could not load private.pem.key file from certs directory:", err.message);
      }
    }

    const rawCert = process.env.AWS_CERTIFICATE;
    let certContent: string | Buffer = "";
    if (rawCert) {
      console.log(`ℹ️ AWS_CERTIFICATE env var detected (length: ${rawCert.length}). Healing PEM...`);
      certContent = healPemString(rawCert, "cert");
    } else {
      try {
        certContent = fs.readFileSync(path.join(certsPath, "certificate.pem.crt"));
      } catch (err: any) {
        console.warn("⚠️ Could not load certificate.pem.crt file from certs directory:", err.message);
      }
    }

    const rawCa = process.env.AWS_ROOT_CA;
    let caContent: string | Buffer = "";
    if (rawCa) {
      console.log(`ℹ️ AWS_ROOT_CA env var detected (length: ${rawCa.length}). Healing PEM...`);
      caContent = healPemString(rawCa, "cert");
    } else {
      try {
        caContent = fs.readFileSync(path.join(certsPath, "AmazonRootCA1.pem"));
      } catch (err: any) {
        console.warn("⚠️ Could not load AmazonRootCA1.pem file from certs directory:", err.message);
      }
    }

    if (!keyContent || !certContent || !caContent) {
      throw new Error("Missing required certificate or private key files/environment variables.");
    }

    const options = {
      key: keyContent,
      cert: certContent,
      ca: caContent,
      clientId: "watchful-dig-guard-backend-" + Math.random().toString(16).substring(2, 8),
      rejectUnauthorized: true,
      ALPNProtocols: ["x-amzn-mqtt-ca"],
    };

    mqttClient = mqtt.connect(`mqtts://${endpoint}:443`, options);
    const client = mqttClient;

    client.on("connect", () => {
      console.log("✅ Connected to AWS IoT Core MQTT Broker!");
      client.subscribe(topic, (err) => {
        if (err) {
          console.error("❌ Subscription error on topic:", topic, err);
        } else {
          console.log("📡 Subscribed to AWS IoT topic:", topic);
        }
      });
    });

    client.on("message", (topicName, message) => {
      try {
        const payload = JSON.parse(message.toString());
        console.log(`📥 Received MQTT [${topicName}]:`, payload);

        // Topic format: 
        // 1. machine/<machineId>/node/<nodeId>/<sensorType>
        // 2. machine/<machineId>/<nodeId>/<sensorType>
        // 3. machine/<machineId>/<sensorType> (fallback)
        const parts = topicName.split("/");
        if (parts.length < 3) return;

        let machineId = parts[1];
        let nodeId = "node-1";
        let sensorType = "";

        if (parts.length >= 5 && parts[2] === "node") {
          nodeId = parts[3];
          sensorType = parts[4];
        } else if (parts.length >= 4) {
          nodeId = parts[2];
          sensorType = parts[3];
        } else {
          sensorType = parts[2];
        }

        // Dynamically register the machine in the global machines array if not present
        let machine = machines.find((m) => m.id === machineId);
        if (!machine) {
          machine = {
            id: machineId,
            type: "Excavator Node",
            operator: `Operator ${machineId}`,
            location: "Sector 5 — Excavation Pit",
            status: "active",
            speedKph: 0,
            hydraulic: "engaged",
            engine: "running",
            healthScore: 95,
            gps: { lat: 19.076 + Math.random() * 0.005, lng: 72.877 + Math.random() * 0.005 },
            cameraStatus: "online",
            lidarStatus: "online",
            canBusStatus: "online",
            lastIncidentAt: new Date().toISOString(),
            nodes: []
          };
          machines.push(machine);
        }

        if (!machine.nodes) {
          machine.nodes = [];
        }

        // Find or create the specific node
        let node = machine.nodes.find((n) => n.id === nodeId);
        if (!node) {
          const charSum = (machineId + nodeId).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const dummyImages = [
            "/images/02e78718-8fc6-42fb-87cb-184ca9a40038.jpeg",
            "/images/3c7d313c-3bc9-48f5-ab59-9a7d90d120ed (1).jpeg",
            "/images/3c7d313c-3bc9-48f5-ab59-9a7d90d120ed.jpeg",
            "/images/e38eb590-5b5c-482b-adec-9349471c3f74.jpeg",
            "/images/133e2b71-fd40-4552-9d32-c2c587e95ea1.jpeg",
            "/images/431f5256-0b8b-45fa-90b3-388a11e6221c.jpeg",
            "/images/4247bd78-7e89-4ca5-a730-7884ccb32342.jpeg",
            "/images/a50bd700-a1f5-46ef-a900-5141af107163.jpeg"
          ];
          const defaultImage = dummyImages[charSum % dummyImages.length];
          node = {
            id: nodeId,
            name: `Sensor Node ${nodeId.toUpperCase()}`,
            cameraStatus: "online",
            lidarStatus: "online",
            latestLidarDistance: 8.0,
            latestCameraImage: defaultImage,
            latestHumanDetected: false
          };
          machine.nodes.push(node);
        }

        if (sensorType === "lidar") {
          node.latestLidarDistance = Number(payload.distance_m ?? 8.0);
          node.lidarStatus = payload.status ?? "online";
        } else if (sensorType === "camera") {
          node.latestHumanDetected = !!payload.human_detected;
          node.latestCameraImage = (payload.image_base64_preview && payload.image_base64_preview !== "NULL" && payload.image_base64_preview !== "none")
            ? payload.image_base64_preview
            : node.latestCameraImage;
          node.cameraStatus = payload.status ?? "online";
        } else if (sensorType === "canbus") {
          machine.speedKph = Math.round(Number(payload.machine_speed_kmh ?? 0));
          machine.status = payload.machine_state ?? "active";
        } else if (sensorType === "gps") {
          const lat = Number(payload.lat ?? payload.latitude);
          const lng = Number(payload.lng ?? payload.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            machine.gps = { lat, lng };
          }
        } else if (sensorType === "health") {
          const score = Number(payload.health_score ?? payload.score);
          if (!isNaN(score)) {
            machine.healthScore = score;
          }
        }

        if (sensorType === "lidar" || sensorType === "camera") {
          // Push telemetry when either sensor updates
          pushTelemetry(
            machineId,
            node.latestHumanDetected ? node.latestLidarDistance : 8.0, 
            payload.timestamp || new Date().toISOString(),
            undefined, 
            undefined, 
            node.latestCameraImage
          );
        }
      } catch (err) {
        console.error("⚠️ Failed to parse message payload JSON:", message.toString(), err);
      }
    });

    client.on("error", (err) => {
      console.error("❌ AWS IoT client connection error:", err);
    });
  } catch (err: any) {
    console.error("❌ Failed to initialize AWS IoT client:", err.message);
  }
}
let mqttClient: any = null;
let simulationTimer: NodeJS.Timeout | null = null;
let simulationIndex = 0;
let isSimulationRunning = false;

interface NodeConfig {
  machineId: string;
  nodeId: string;
  distOffset: number;
  speedOffset: number;
}

const NODES_CONFIG: NodeConfig[] = [
  { machineId: "EX-2001", nodeId: "node-1", distOffset: 0.0, speedOffset: 0.0 },
  { machineId: "EX-2001", nodeId: "node-2", distOffset: 1.5, speedOffset: 0.0 },
  { machineId: "EX-2002", nodeId: "node-3", distOffset: -0.8, speedOffset: 2.0 },
  { machineId: "EX-2002", nodeId: "node-4", distOffset: 0.5, speedOffset: 2.0 },
  { machineId: "EX-2003", nodeId: "node-5", distOffset: 2.2, speedOffset: -1.5 },
];

function parseCsv(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, index) => {
      row[h] = values[index] ?? "";
    });
    return row;
  });
}

let node01Rows: Record<string, string>[] = [];
let node02Rows: Record<string, string>[] = [];
let node03Rows: Record<string, string>[] = [];
let node04Rows: Record<string, string>[] = [];
let node05Rows: Record<string, string>[] = [];

function runSimulationStep() {
  const maxRows = Math.max(
    node01Rows.length,
    node02Rows.length,
    node03Rows.length,
    node04Rows.length,
    node05Rows.length
  );
  if (maxRows === 0) return;

  const idx = simulationIndex;
  simulationIndex++;

  NODES_CONFIG.forEach(cfg => {
    let rows: Record<string, string>[] = [];
    if (cfg.nodeId === "node-1") rows = node01Rows;
    else if (cfg.nodeId === "node-2") rows = node02Rows;
    else if (cfg.nodeId === "node-3") rows = node03Rows;
    else if (cfg.nodeId === "node-4") rows = node04Rows;
    else if (cfg.nodeId === "node-5") rows = node05Rows;

    if (rows.length === 0) return;
    const row = rows[idx % rows.length];

    const timestamp = row.timestamp || new Date().toISOString();
    const dist = Number(row.distance_m ?? 8.0);
    const humanDet = (row.human_detected ?? "").toUpperCase() === "TRUE";
    const speed = Number(row.machine_speed_kmh ?? 0.0);
    const state = row.machine_state ?? "active";
    const rotation = Number(row.cabin_rotation_deg ?? 0);
    let image = row.image_base64_preview ?? "";
    if (!image || image === "NULL" || image === "none") {
      const isFrontNode = cfg.nodeId === "node-1" || cfg.nodeId === "node-3" || cfg.nodeId === "node-5";
      const frontImages = [
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
        "/images/extracted_image_12.jpg"
      ];
      const rearImages = [
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
      const nodeImages = isFrontNode ? frontImages : rearImages;
      image = nodeImages[Math.floor(Math.random() * nodeImages.length)];
    }

    // Update nodes directly in local memory
    let machine = machines.find((m) => m.id === cfg.machineId);
    if (machine) {
      machine.speedKph = Math.round(speed);
      machine.status = state as any;

      if (!machine.nodes) machine.nodes = [];
      let node = machine.nodes.find(n => n.id === cfg.nodeId);
      if (!node) {
        node = {
          id: cfg.nodeId,
          name: `Sensor Node ${cfg.nodeId.toUpperCase()}`,
          cameraStatus: "online",
          lidarStatus: "online",
          latestLidarDistance: 8.0,
          latestCameraImage: image,
          latestHumanDetected: false
        };
        machine.nodes.push(node);
      }

      node.latestLidarDistance = Number(dist.toFixed(2));
      node.latestHumanDetected = humanDet;
      node.latestCameraImage = image;
    }

    if (mqttClient && mqttClient.connected) {
      const topicPrefix = `machine/${cfg.machineId}/node/${cfg.nodeId}`;
      mqttClient.publish(`${topicPrefix}/camera`, JSON.stringify({
        timestamp,
        device_id: row.node_id || `ESP32-S3-CAM-${cfg.nodeId}`,
        human_detected: humanDet,
        confidence_score: Number(row.confidence_score ?? 0.0),
        image_base64_preview: image
      }));

      mqttClient.publish(`${topicPrefix}/lidar`, JSON.stringify({
        timestamp,
        sensor_id: `TF-LUNA-${cfg.nodeId}`,
        distance_m: Number(dist.toFixed(2))
      }));

      mqttClient.publish(`${topicPrefix}/canbus`, JSON.stringify({
        timestamp,
        machine_id: cfg.machineId,
        machine_speed_kmh: Number(speed.toFixed(1)),
        machine_state: state,
        cabin_rotation_deg: rotation
      }));
    }

    pushTelemetry(
      cfg.machineId,
      humanDet ? dist : 8.0,
      timestamp,
      undefined,
      undefined,
      image,
      cfg.nodeId
    );
  });
}

function startSimulation() {
  if (isSimulationRunning) return;
  
  try {
    const dataDir = path.join(process.cwd(), "data");
    node01Rows = parseCsv(path.join(dataDir, "node_01_fused.csv"));
    node02Rows = parseCsv(path.join(dataDir, "node_02_fused.csv"));
    node03Rows = parseCsv(path.join(dataDir, "node_03_fused.csv"));
    node04Rows = parseCsv(path.join(dataDir, "node_04_fused.csv"));
    node05Rows = parseCsv(path.join(dataDir, "node_05_fused.csv"));

    isSimulationRunning = true;
    simulationTimer = setInterval(() => {
      runSimulationStep();
    }, 2000);

    console.log("▶️ Background Simulation Started!");
  } catch (err: any) {
    console.error("❌ Failed to start simulation:", err.message);
  }
}

function stopSimulation() {
  if (!isSimulationRunning) return;
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
  isSimulationRunning = false;
  console.log("⏸️ Background Simulation Stopped.");
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

  if (req.method === "POST" && path === "/api/simulation/start") {
    startSimulation();
    sendJson({ ok: true, running: true });
    return;
  }

  if (req.method === "POST" && path === "/api/simulation/stop") {
    stopSimulation();
    sendJson({ ok: true, running: false });
    return;
  }

  if (req.method === "GET" && path === "/api/simulation/status") {
    sendJson({ running: isSimulationRunning });
    return;
  }

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

  if (req.method === "POST" && path === "/api/auth/signup") {
    handlePost((body) => {
      const { email, password } = JSON.parse(body || "{}");
      if (!email || !password) {
        return sendJson({ error: "Email and password are required" }, 400);
      }
      
      const emailLower = email.toLowerCase().trim();
      
      // Password validation
      const pwdError = validatePassword(password);
      if (pwdError) {
        return sendJson({ error: pwdError }, 400);
      }

      // Check if user exists
      const users = loadUsers();
      if (users[emailLower]) {
        return sendJson({ error: "Email already exists" }, 400);
      }

      // Save user
      users[emailLower] = {
        password,
        role: "supervisor",
        name: emailLower.split("@")[0].replace(/\b\w/g, (c: string) => c.toUpperCase())
      };
      saveUsers(users);

      sendJson({ ok: true });
    });
    return;
  }

  if (req.method === "POST" && path === "/api/auth/login") {
    handlePost((body) => {
      const { email, password } = JSON.parse(body || "{}");
      if (!email || !password) {
        return sendJson({ error: "Email and password are required" }, 400);
      }

      const emailLower = email.toLowerCase().trim();
      const users = loadUsers();
      const user = users[emailLower];

      if (!user || user.password !== password) {
        return sendJson({ error: "Invalid email or password" }, 401);
      }

      sendJson({
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        name: user.name,
        email: emailLower,
        role: user.role,
      });
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
    const updatedEvidence = incidents.map((inc, i) => {
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
