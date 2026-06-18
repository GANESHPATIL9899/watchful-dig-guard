export type ZoneStatus = "safe" | "warning" | "critical" | "emergency";
export type Severity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "escalated";
export type SensorStatus = "online" | "offline" | "degraded";

export interface Worker {
  id: string;
  name: string;
  photoUrl: string;
  age: number;
  role: string;
  contractor: string;
  phone: string;
  assignedZone: string;
  shift: string;
  trainingStatus: "completed" | "pending" | "expired";
  ppeCompliant: boolean;
  emergencyContact: string;
  medicalNotes?: string;
  certifications: string[];
}

export interface Machine {
  id: string;
  type: string;
  operator: string;
  location: string;
  status: "active" | "idle" | "maintenance" | "offline";
  speedKph: number;
  hydraulic: "engaged" | "locked" | "fault";
  engine: "running" | "stopped";
  healthScore: number;
  gps: { lat: number; lng: number };
  cameraStatus: SensorStatus;
  lidarStatus: SensorStatus;
  canBusStatus: SensorStatus;
  lastIncidentAt?: string;
}

export interface Incident {
  id: string;
  timestamp: string;
  workerId: string;
  workerName: string;
  machineId: string;
  distanceM: number;
  riskLevel: ZoneStatus;
  severity: Severity;
  alertType: string;
  imageUrl: string;
  videoUrl?: string;
  actionTaken: string;
  emergencyStop: boolean;
  resolutionStatus: "open" | "investigating" | "resolved";
  location: string;
  gps: { lat: number; lng: number };
  rootCause?: string;
  supervisorRemarks?: string;
}

export interface Alert {
  id: string;
  type:
    | "worker_near_machine"
    | "danger_zone_entry"
    | "emergency_stop"
    | "camera_offline"
    | "lidar_offline"
    | "can_bus_failure"
    | "communication_failure";
  severity: Severity;
  machineId: string;
  workerId?: string;
  distanceM?: number;
  status: AlertStatus;
  message: string;
  createdAt: string;
}

export interface KpiSnapshot {
  machinesActive: number;
  workersDetectedToday: number;
  activeAlerts: number;
  emergencyStops: number;
  nearMissIncidents: number;
  complianceScore: number;
  camerasOnline: number;
  systemHealth: number;
}

export interface TrendPoint {
  label: string;
  alerts: number;
  incidents: number;
  emergencyStops: number;
  compliance: number;
}

export interface EvidenceImage {
  id: string;
  imageUrl: string;
  capturedAt: string;
  workerId: string;
  machineId: string;
  distanceM: number;
  alertType: string;
  confidence: number;
  emergencyStop: boolean;
  notes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "supervisor" | "safety_officer" | "project_manager" | "equipment_manager";
  avatarUrl?: string;
}
