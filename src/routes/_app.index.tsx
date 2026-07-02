import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/common/AppShell";
import { KpiCard } from "@/components/common/KpiCard";
import { useDashboardKpis, useMachines, useAlerts, useIncidents } from "@/hooks/data";
import { SiteHeatMap } from "@/components/dashboard/SiteHeatMap";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentCriticalEvents } from "@/components/dashboard/RecentCriticalEvents";
import { Truck, Users, Bell, OctagonX, AlertTriangle, ShieldCheck, Camera, Activity, Cpu, Wifi, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Site Safety Hub" },
      { name: "description", content: "Real-time overview of construction site safety: machines, workers, alerts, emergency stops, and compliance." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [selectedNode, setSelectedNode] = useState<string>("all");
  const { data: k } = useDashboardKpis();
  const { data: machines = [] } = useMachines();
  const { data: alerts = [] } = useAlerts();
  const { data: incidents = [] } = useIncidents();

  const machine = machines.find((m) => m.id === selectedNode);
  const machineAlerts = alerts.filter(a => a.machineId === selectedNode && a.status === "active").length;
  const machineEstops = incidents.filter(i => i.machineId === selectedNode && i.emergencyStop).length;

  return (
    <AppShell
      title="Executive Dashboard"
      subtitle={selectedNode === "all" ? "Live overview of site safety, fleet health and AI detections" : `Live status and sensor telemetry for machine ${selectedNode}`}
      toolbar={
        <div className="flex items-center gap-3">
          <Select value={selectedNode} onValueChange={setSelectedNode}>
            <SelectTrigger className="w-[200px] bg-card border-border">
              <SelectValue placeholder="Filter by Node/Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Nodes (Aggregate)</SelectItem>
              {machines.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.id} ({m.type.split(" ")[0]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      }
    >
      {selectedNode === "all" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="Machines Active" value={k?.machinesActive ?? "—"} icon={Truck} tone="info" delta={{ value: "2", positive: true }} />
          <KpiCard label="Workers Detected (today)" value={k?.workersDetectedToday ?? "—"} icon={Users} tone="default" delta={{ value: "14%", positive: true }} />
          <KpiCard label="Active Alerts" value={k?.activeAlerts ?? "—"} icon={Bell} tone="warning" delta={{ value: "3", positive: false }} />
          <KpiCard label="Emergency Stops" value={k?.emergencyStops ?? "—"} icon={OctagonX} tone="critical" hint="Hydraulic interrupts engaged" />
          <KpiCard label="Near-Miss Incidents" value={k?.nearMissIncidents ?? "—"} icon={AlertTriangle} tone="warning" />
          <KpiCard label="Compliance Score" value={`${k?.complianceScore ?? 0}%`} icon={ShieldCheck} tone="safe" delta={{ value: "1.2%", positive: true }} />
          <KpiCard label="Cameras Online" value={k?.camerasOnline ?? "—"} icon={Camera} tone="info" />
          <KpiCard label="System Health" value={`${k?.systemHealth ?? 0}%`} icon={Activity} tone="safe" />
        </div>
      ) : machine ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard 
            label="Machine Status" 
            value={machine.status.toUpperCase()} 
            icon={Activity} 
            tone={machine.status === "active" ? "safe" : machine.status === "idle" ? "warning" : "default"} 
          />
          <KpiCard label="Current Speed" value={`${machine.speedKph} km/h`} icon={Truck} tone="info" />
          <KpiCard 
            label="Health Score" 
            value={`${machine.healthScore}%`} 
            icon={Cpu} 
            tone={machine.healthScore > 85 ? "safe" : machine.healthScore > 70 ? "warning" : "critical"} 
          />
          <KpiCard label="Active Alerts" value={machineAlerts} icon={Bell} tone={machineAlerts > 0 ? "critical" : "safe"} />
          <KpiCard label="Emergency Stops" value={machineEstops} icon={OctagonX} tone={machineEstops > 0 ? "critical" : "safe"} />
          <KpiCard 
            label="Camera Node Status" 
            value={machine.cameraStatus.toUpperCase()} 
            icon={Camera} 
            tone={machine.cameraStatus === "online" ? "safe" : machine.cameraStatus === "degraded" ? "warning" : "critical"} 
          />
          <KpiCard 
            label="Lidar Node Status" 
            value={machine.lidarStatus.toUpperCase()} 
            icon={Wifi} 
            tone={machine.lidarStatus === "online" ? "safe" : machine.lidarStatus === "degraded" ? "warning" : "critical"} 
          />
          <KpiCard 
            label="CAN-Bus Node Status" 
            value={machine.canBusStatus.toUpperCase()} 
            icon={Eye} 
            tone={machine.canBusStatus === "online" ? "safe" : "critical"} 
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Loading node details or node not found...
        </div>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SiteHeatMap selectedNode={selectedNode} />
        </div>
        <TrendChart />
      </div>

      <div className="mt-6">
        <RecentCriticalEvents selectedNode={selectedNode} />
      </div>
    </AppShell>
  );
}
