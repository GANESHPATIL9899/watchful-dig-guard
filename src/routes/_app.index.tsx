import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { KpiCard } from "@/components/common/KpiCard";
import { useDashboardKpis } from "@/hooks/data";
import { SiteHeatMap } from "@/components/dashboard/SiteHeatMap";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentCriticalEvents } from "@/components/dashboard/RecentCriticalEvents";
import { Truck, Users, Bell, OctagonX, AlertTriangle, ShieldCheck, Camera, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  const { data: k } = useDashboardKpis();
  return (
    <AppShell
      title="Executive Dashboard"
      subtitle="Live overview of site safety, fleet health and AI detections"
      toolbar={
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      }
    >
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

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SiteHeatMap />
        </div>
        <TrendChart />
      </div>

      <div className="mt-6">
        <RecentCriticalEvents />
      </div>
    </AppShell>
  );
}
