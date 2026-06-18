import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useMachines, useWorkers } from "@/hooks/data";
import { LiveCameraViewer } from "@/components/machines/LiveCameraViewer";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/live")({
  head: () => ({
    meta: [
      { title: "Live Monitoring — Site Safety Hub" },
      { name: "description", content: "Live camera feeds with AI worker detection overlays, LiDAR distance and machine telemetry." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const { data: machines = [] } = useMachines();
  const { data: workers = [] } = useWorkers();
  const [selectedId, setSelectedId] = useState<string>("");
  const machine = machines.find((m) => m.id === selectedId) ?? machines[0];
  const worker = workers[0];

  if (!machine || !worker) return <AppShell title="Live Monitoring"><div /></AppShell>;

  return (
    <AppShell
      title="Live Machine Monitoring"
      subtitle={`Watching ${machine.id} · ${machine.location}`}
      toolbar={
        <Select value={machine.id} onValueChange={setSelectedId}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {machines.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.id} · {m.type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <LiveCameraViewer machine={machine} workerName={worker.name} />
        </div>

        <div className="space-y-4">
          {/* Machine info */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold">Machine</p>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="ID" v={<span className="font-mono">{machine.id}</span>} />
              <Row k="Type" v={machine.type} />
              <Row k="Operator" v={machine.operator} />
              <Row k="Location" v={machine.location} />
              <Row k="Speed" v={<span className="font-mono">{machine.speedKph} km/h</span>} />
              <Row k="Hydraulic" v={<StatusBadge tone={machine.hydraulic === "engaged" ? "safe" : machine.hydraulic === "locked" ? "warning" : "critical"}>{machine.hydraulic}</StatusBadge>} />
              <Row k="Engine" v={<StatusBadge tone={machine.engine === "running" ? "safe" : "muted"}>{machine.engine}</StatusBadge>} />
              <Row k="Health" v={<span className="font-mono">{machine.healthScore}%</span>} />
              <Row k="GPS" v={<span className="font-mono text-xs">{machine.gps.lat.toFixed(4)}, {machine.gps.lng.toFixed(4)}</span>} />
            </dl>
          </div>

          {/* Worker detection */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold">Detected Worker</p>
            <div className="mt-3 flex items-center gap-3">
              <img src={worker.photoUrl} alt="" className="h-12 w-12 rounded-md ring-1 ring-border" />
              <div>
                <p className="text-sm font-semibold">{worker.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{worker.id} · {worker.role}</p>
              </div>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Assigned Zone" v={worker.assignedZone} />
              <Row k="PPE" v={<StatusBadge tone={worker.ppeCompliant ? "safe" : "critical"}>{worker.ppeCompliant ? "compliant" : "violation"}</StatusBadge>} />
              <Row k="Training" v={<StatusBadge tone={worker.trainingStatus === "completed" ? "safe" : worker.trainingStatus === "pending" ? "warning" : "critical"}>{worker.trainingStatus}</StatusBadge>} />
            </dl>
          </div>

          {/* Sensors */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold">Sensors</p>
            <div className="mt-3 space-y-2 text-sm">
              <Row k="Rear Camera (IR)" v={<StatusBadge sensor={machine.cameraStatus} dot>{machine.cameraStatus}</StatusBadge>} />
              <Row k="TF-Luna LiDAR" v={<StatusBadge sensor={machine.lidarStatus} dot>{machine.lidarStatus}</StatusBadge>} />
              <Row k="CAN Bus" v={<StatusBadge sensor={machine.canBusStatus} dot>{machine.canBusStatus}</StatusBadge>} />
            </div>
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
