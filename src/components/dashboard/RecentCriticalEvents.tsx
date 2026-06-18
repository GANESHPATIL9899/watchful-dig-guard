import { useIncidents } from "@/hooks/data";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ZONE_LABEL } from "@/constants";
import { formatDistance } from "@/business/risk";
import { relativeTime } from "@/utils/format";
import type { Incident } from "@/types";
import { useNavigate } from "@tanstack/react-router";

export function RecentCriticalEvents() {
  const { data: incidents = [] } = useIncidents();
  const navigate = useNavigate();
  const critical = incidents
    .filter((i) => i.riskLevel === "critical" || i.riskLevel === "emergency")
    .slice(0, 6);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Recent Critical Events</p>
          <p className="text-xs text-muted-foreground">Last hazardous detections across the site</p>
        </div>
        <button onClick={() => navigate({ to: "/incidents" })} className="text-xs font-medium text-info hover:underline">
          View all →
        </button>
      </div>
      <DataTable<Incident>
        data={critical}
        columns={[
          { key: "timestamp", header: "Time", render: (r) => <span className="font-mono text-xs">{relativeTime(r.timestamp)}</span> },
          { key: "machineId", header: "Machine", render: (r) => <span className="font-mono">{r.machineId}</span> },
          { key: "workerName", header: "Worker" },
          { key: "distanceM", header: "Distance", render: (r) => <span className="font-mono">{formatDistance(r.distanceM)}</span> },
          { key: "riskLevel", header: "Risk", render: (r) => <StatusBadge zone={r.riskLevel} dot>{ZONE_LABEL[r.riskLevel]}</StatusBadge> },
          { key: "actionTaken", header: "Action Taken" },
          {
            key: "resolutionStatus",
            header: "Status",
            render: (r) => (
              <StatusBadge tone={r.resolutionStatus === "resolved" ? "safe" : r.resolutionStatus === "investigating" ? "info" : "warning"}>
                {r.resolutionStatus}
              </StatusBadge>
            ),
          },
        ]}
      />
    </div>
  );
}
