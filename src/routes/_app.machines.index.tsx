import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useMachines } from "@/hooks/data";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { relativeTime } from "@/utils/format";
import type { Machine } from "@/types";

export const Route = createFileRoute("/_app/machines/")({
  head: () => ({
    meta: [
      { title: "Fleet — Site Safety Hub" },
      { name: "description", content: "Manage all excavators: operators, sensor health, location and incident history." },
    ],
  }),
  component: MachinesPage,
});

function MachinesPage() {
  const { data = [] } = useMachines();
  return (
    <AppShell title="Machine Fleet Management" subtitle={`${data.length} excavators in fleet`}>
      <DataTable<Machine>
        data={data}
        columns={[
          { key: "id", header: "ID", render: (m) => <Link to="/machines/$id" params={{ id: m.id }} className="font-mono text-info hover:underline">{m.id}</Link> },
          { key: "type", header: "Type" },
          { key: "operator", header: "Operator" },
          { key: "location", header: "Location" },
          { key: "status", header: "Status", render: (m) => <StatusBadge tone={m.status === "active" ? "safe" : m.status === "idle" ? "info" : m.status === "maintenance" ? "warning" : "muted"}>{m.status}</StatusBadge> },
          { key: "cameraStatus", header: "Camera", render: (m) => <StatusBadge sensor={m.cameraStatus} dot>{m.cameraStatus}</StatusBadge> },
          { key: "lidarStatus", header: "LiDAR", render: (m) => <StatusBadge sensor={m.lidarStatus} dot>{m.lidarStatus}</StatusBadge> },
          { key: "canBusStatus", header: "CAN", render: (m) => <StatusBadge sensor={m.canBusStatus} dot>{m.canBusStatus}</StatusBadge> },
          { key: "healthScore", header: "Health", render: (m) => <span className="font-mono">{m.healthScore}%</span> },
          { key: "lastIncidentAt", header: "Last Incident", render: (m) => <span className="text-xs text-muted-foreground">{m.lastIncidentAt ? relativeTime(m.lastIncidentAt) : "—"}</span> },
        ]}
      />
    </AppShell>
  );
}
