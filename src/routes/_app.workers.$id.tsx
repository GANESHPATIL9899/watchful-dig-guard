import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useWorker, useIncidents } from "@/hooks/data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, relativeTime } from "@/utils/format";
import { formatDistance } from "@/business/risk";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/workers/$id")({
  head: () => ({
    meta: [{ title: "Worker · Site Safety Hub" }],
  }),
  component: WorkerDetailPage,
});

function WorkerDetailPage() {
  const { id } = Route.useParams();
  const { data: worker } = useWorker(id);
  const { data: incidents = [] } = useIncidents();

  if (!worker) return <AppShell title="Worker"><div /></AppShell>;
  const events = incidents.filter((i) => i.workerId === id);
  const warnings = events.filter((e) => e.riskLevel === "warning").length;
  const dangerEntries = events.filter((e) => e.riskLevel === "critical").length;
  const nearMiss = events.filter((e) => e.riskLevel === "emergency").length;

  return (
    <AppShell title={worker.name} subtitle={`Worker ${worker.id} · ${worker.contractor}`}>
      <Link to="/workers" className="mb-4 inline-flex items-center gap-1 text-sm text-info hover:underline">
        <ArrowLeft className="h-4 w-4" /> All workers
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <img src={worker.photoUrl} alt="" className="h-16 w-16 rounded-md ring-1 ring-border" />
            <div>
              <p className="text-lg font-semibold">{worker.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{worker.id}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Age" v={worker.age} />
            <Row k="Role" v={worker.role} />
            <Row k="Shift" v={worker.shift} />
            <Row k="Zone" v={worker.assignedZone} />
            <Row k="Phone" v={<span className="font-mono">{worker.phone}</span>} />
            <Row k="Emergency" v={<span className="font-mono">{worker.emergencyContact}</span>} />
            <Row k="PPE" v={<StatusBadge tone={worker.ppeCompliant ? "safe" : "critical"}>{worker.ppeCompliant ? "compliant" : "violation"}</StatusBadge>} />
            <Row k="Training" v={<StatusBadge tone={worker.trainingStatus === "completed" ? "safe" : worker.trainingStatus === "pending" ? "warning" : "critical"}>{worker.trainingStatus}</StatusBadge>} />
            {worker.medicalNotes && <Row k="Medical" v={<span className="text-right text-xs">{worker.medicalNotes}</span>} />}
          </dl>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Certifications</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {worker.certifications.map((c) => (
                <StatusBadge key={c} tone="info">{c}</StatusBadge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Total Detections" value={events.length} />
            <Stat label="Warnings" value={warnings} tone="warning" />
            <Stat label="Danger Zone" value={dangerEntries} tone="critical" />
            <Stat label="Near Misses" value={nearMiss} tone="critical" />
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Incident Timeline</p>
            </div>
            <ol className="divide-y divide-border">
              {events.slice(0, 12).map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full" style={{ background: e.riskLevel === "emergency" || e.riskLevel === "critical" ? "var(--critical)" : e.riskLevel === "warning" ? "var(--warning)" : "var(--safe)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{e.alertType}</p>
                      <StatusBadge zone={e.riskLevel}>{e.riskLevel}</StatusBadge>
                      <span className="font-mono text-xs text-muted-foreground">{e.machineId} · {formatDistance(e.distanceM)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{e.actionTaken} · {formatDateTime(e.timestamp)} · {relativeTime(e.timestamp)}</p>
                  </div>
                </li>
              ))}
              {events.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No incidents recorded</li>}
            </ol>
          </div>
        </div>
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
function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warning" | "critical" }) {
  const c = tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <div className="kpi-card">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold ${c}`}>{value}</p>
    </div>
  );
}
