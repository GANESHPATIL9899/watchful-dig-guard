import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useIncidents } from "@/hooks/data";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ZONE_LABEL, SEVERITY_LABEL } from "@/constants";
import { formatDistance } from "@/business/risk";
import { formatDateTime } from "@/utils/format";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Incident } from "@/types";

export const Route = createFileRoute("/_app/incidents")({
  head: () => ({
    meta: [
      { title: "Incidents — Site Safety Hub" },
      { name: "description", content: "Log of all worker-proximity incidents, severities, captured evidence and supervisor actions." },
    ],
  }),
  component: IncidentsPage,
});

function IncidentsPage() {
  const { data = [] } = useIncidents();
  const [sev, setSev] = useState<string>("all");
  const [sel, setSel] = useState<Incident | null>(null);
  const filtered = sev === "all" ? data : data.filter((i) => i.severity === sev);

  return (
    <AppShell
      title="Incident Management"
      subtitle={`${data.length} incidents on record`}
      toolbar={
        <Select value={sev} onValueChange={setSev}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <DataTable<Incident>
        data={filtered}
        onRowClick={setSel}
        columns={[
          { key: "id", header: "ID", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
          { key: "timestamp", header: "When", render: (r) => formatDateTime(r.timestamp) },
          { key: "workerName", header: "Worker" },
          { key: "machineId", header: "Machine", render: (r) => <span className="font-mono">{r.machineId}</span> },
          { key: "location", header: "Location" },
          { key: "distanceM", header: "Distance", render: (r) => <span className="font-mono">{formatDistance(r.distanceM)}</span> },
          { key: "riskLevel", header: "Zone", render: (r) => <StatusBadge zone={r.riskLevel}>{ZONE_LABEL[r.riskLevel]}</StatusBadge> },
          { key: "severity", header: "Severity", render: (r) => <StatusBadge severity={r.severity}>{SEVERITY_LABEL[r.severity]}</StatusBadge> },
          { key: "resolutionStatus", header: "Status", render: (r) => <StatusBadge tone={r.resolutionStatus === "resolved" ? "safe" : r.resolutionStatus === "investigating" ? "info" : "warning"}>{r.resolutionStatus}</StatusBadge> },
        ]}
      />

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-3xl">
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono">{sel.id} · {sel.alertType}</DialogTitle>
              </DialogHeader>
              <img src={sel.imageUrl} alt="" className="w-full rounded-md border border-border" />
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <Field k="When" v={formatDateTime(sel.timestamp)} />
                <Field k="Worker" v={`${sel.workerName} (${sel.workerId})`} />
                <Field k="Machine" v={<span className="font-mono">{sel.machineId}</span>} />
                <Field k="Distance" v={<span className="font-mono">{formatDistance(sel.distanceM)}</span>} />
                <Field k="Zone" v={<StatusBadge zone={sel.riskLevel}>{sel.riskLevel}</StatusBadge>} />
                <Field k="Severity" v={<StatusBadge severity={sel.severity}>{sel.severity}</StatusBadge>} />
                <Field k="AI Decision" v={sel.actionTaken} />
                <Field k="E-Stop" v={<StatusBadge tone={sel.emergencyStop ? "critical" : "muted"}>{sel.emergencyStop ? "engaged" : "—"}</StatusBadge>} />
                <Field k="Resolution" v={sel.resolutionStatus} />
              </div>
              {sel.rootCause && <p className="text-sm"><span className="text-muted-foreground">Root cause: </span>{sel.rootCause}</p>}
              {sel.supervisorRemarks && <p className="text-sm"><span className="text-muted-foreground">Remarks: </span>{sel.supervisorRemarks}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}
