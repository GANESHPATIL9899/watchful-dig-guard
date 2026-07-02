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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

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

  // Parse selection
  const isFiltered = selectedNode !== "all";
  const [selectedMachineId, selectedNodeType] = isFiltered ? selectedNode.split("-") : ["", ""];
  const machine = machines.find((m) => m.id === selectedMachineId);

  // Filter metrics
  const machineAlerts = alerts.filter(a => a.machineId === selectedMachineId && a.status === "active").length;
  const machineEstops = incidents.filter(i => i.machineId === selectedMachineId && i.emergencyStop).length;

  return (
    <AppShell
      title="Executive Dashboard"
      subtitle={
        !isFiltered 
          ? "Live overview of site safety, fleet health and AI detections" 
          : `Live sensor telemetry for machine ${selectedMachineId} · ${selectedNodeType.toUpperCase()} NODE`
      }
      toolbar={
        <div className="flex items-center gap-3">
          <Select value={selectedNode} onValueChange={setSelectedNode}>
            <SelectTrigger className="w-[280px] bg-card border-border">
              <SelectValue placeholder="Select Node / Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines (Aggregate)</SelectItem>
              {machines.slice(0, 3).map((m) => (
                <SelectGroup key={m.id}>
                  <SelectLabel className="font-bold text-xs text-info px-2 py-1 mt-1 bg-muted/40 rounded-sm">
                    {m.id} ({m.type.split(" ")[0]})
                  </SelectLabel>
                  <SelectItem value={`${m.id}-camera`}>↳ {m.id} - Camera Node (AI Vision)</SelectItem>
                  <SelectItem value={`${m.id}-lidar`}>↳ {m.id} - Lidar Node (Proximity)</SelectItem>
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      }
    >
      {!isFiltered ? (
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
        selectedNodeType === "camera" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard label="Node Type" value="CAMERA (AI VISION)" icon={Camera} tone="info" />
            <KpiCard label="Node Status" value={machine.cameraStatus.toUpperCase()} icon={Activity} tone={machine.cameraStatus === "online" ? "safe" : "critical"} />
            <KpiCard label="Connection Health" value={`${machine.healthScore}%`} icon={Cpu} tone={machine.healthScore > 80 ? "safe" : "warning"} />
            <KpiCard label="Operator Assigned" value={machine.operator} icon={Users} tone="default" />
            <KpiCard label="Camera Feed Alert" value={machineAlerts > 0 ? "Breach Detected" : "Clear"} icon={Bell} tone={machineAlerts > 0 ? "critical" : "safe"} />
            <KpiCard label="E-Stops Handled" value={machineEstops} icon={OctagonX} tone={machineEstops > 0 ? "critical" : "safe"} />
            <KpiCard label="Speed Tracking" value={`${machine.speedKph} km/h`} icon={Truck} tone="default" />
            <KpiCard label="Lidar Cross-Link" value={machine.lidarStatus === "online" ? "CONNECTED" : "OFFLINE"} icon={Wifi} tone={machine.lidarStatus === "online" ? "safe" : "critical"} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard label="Node Type" value="LIDAR (PROXIMITY)" icon={Wifi} tone="info" />
            <KpiCard label="Node Status" value={machine.lidarStatus.toUpperCase()} icon={Activity} tone={machine.lidarStatus === "online" ? "safe" : "critical"} />
            <KpiCard label="Connection Health" value={`${machine.healthScore}%`} icon={Cpu} tone={machine.healthScore > 80 ? "safe" : "warning"} />
            <KpiCard label="Laser Frequency" value="50 Hz Scans" icon={Activity} tone="default" />
            <KpiCard label="Proximity Alerts" value={machineAlerts} icon={Bell} tone={machineAlerts > 0 ? "critical" : "safe"} />
            <KpiCard label="Emergency Stops" value={machineEstops} icon={OctagonX} tone={machineEstops > 0 ? "critical" : "safe"} />
            <KpiCard label="Speed Tracking" value={`${machine.speedKph} km/h`} icon={Truck} tone="default" />
            <KpiCard label="Camera Cross-Link" value={machine.cameraStatus === "online" ? "CONNECTED" : "OFFLINE"} icon={Camera} tone={machine.cameraStatus === "online" ? "safe" : "critical"} />
          </div>
        )
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Loading node details or node not found...
        </div>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SiteHeatMap selectedNode={selectedMachineId || "all"} />
        </div>
        <TrendChart />
      </div>

      <div className="mt-6">
        <RecentCriticalEvents selectedNode={selectedMachineId || "all"} />
      </div>
    </AppShell>
  );
}
