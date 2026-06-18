import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useMachine, useIncidents } from "@/hooks/data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ArrowLeft } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import { formatDistance } from "@/business/risk";

export const Route = createFileRoute("/_app/machines/$id")({
  head: () => ({ meta: [{ title: "Machine · Site Safety Hub" }] }),
  component: MachineDetailPage,
});

function MachineDetailPage() {
  const { id } = Route.useParams();
  const { data: m } = useMachine(id);
  const { data: incidents = [] } = useIncidents();
  if (!m) return <AppShell title="Machine"><div /></AppShell>;
  const history = incidents.filter((i) => i.machineId === id);

  return (
    <AppShell title={m.id} subtitle={`${m.type} · ${m.location}`}>
      <Link to="/machines" className="mb-4 inline-flex items-center gap-1 text-sm text-info hover:underline">
        <ArrowLeft className="h-4 w-4" /> Fleet
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-semibold">Information</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="ID" v={<span className="font-mono">{m.id}</span>} />
            <Row k="Type" v={m.type} />
            <Row k="Operator" v={m.operator} />
            <Row k="Location" v={m.location} />
            <Row k="GPS" v={<span className="font-mono text-xs">{m.gps.lat.toFixed(4)}, {m.gps.lng.toFixed(4)}</span>} />
            <Row k="Status" v={<StatusBadge tone={m.status === "active" ? "safe" : "info"}>{m.status}</StatusBadge>} />
            <Row k="Health" v={<span className="font-mono">{m.healthScore}%</span>} />
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-semibold">Sensor Health</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Camera (IR)" v={<StatusBadge sensor={m.cameraStatus} dot>{m.cameraStatus}</StatusBadge>} />
            <Row k="TF-Luna LiDAR" v={<StatusBadge sensor={m.lidarStatus} dot>{m.lidarStatus}</StatusBadge>} />
            <Row k="CAN Bus" v={<StatusBadge sensor={m.canBusStatus} dot>{m.canBusStatus}</StatusBadge>} />
            <Row k="Hydraulic" v={<StatusBadge tone={m.hydraulic === "engaged" ? "safe" : m.hydraulic === "locked" ? "warning" : "critical"}>{m.hydraulic}</StatusBadge>} />
            <Row k="Engine" v={<StatusBadge tone={m.engine === "running" ? "safe" : "muted"}>{m.engine}</StatusBadge>} />
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-semibold">Maintenance</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-muted-foreground">Last service</span><span>14 days ago</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Next service</span><span>in 16 days</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">LiDAR calibration</span><span>4 days ago</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Camera lens clean</span><span>2 days ago</span></li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Incident History</p>
        </div>
        <ol className="divide-y divide-border">
          {history.slice(0, 12).map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
                <span className="font-medium">{e.alertType}</span>
                <StatusBadge zone={e.riskLevel}>{e.riskLevel}</StatusBadge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{formatDistance(e.distanceM)}</span>
                <span>{formatDateTime(e.timestamp)}</span>
              </div>
            </li>
          ))}
          {history.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No incidents</li>}
        </ol>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
