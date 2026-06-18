import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useWorkers, useIncidents } from "@/hooks/data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/workers/")({
  head: () => ({
    meta: [
      { title: "Workers — Site Safety Hub" },
      { name: "description", content: "Directory of all site workers with safety status, contractor, training and recent detections." },
    ],
  }),
  component: WorkersPage,
});

function WorkersPage() {
  const { data: workers = [] } = useWorkers();
  const { data: incidents = [] } = useIncidents();
  const [q, setQ] = useState("");

  const filtered = workers.filter((w) =>
    [w.name, w.id, w.role, w.contractor].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Worker Safety Tracking"
      subtitle={`${workers.length} workers across active contractors`}
      toolbar={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workers…" className="h-9 w-64 pl-8 bg-background" />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((w) => {
          const exposure = incidents.filter((i) => i.workerId === w.id).length;
          return (
            <Link
              key={w.id}
              to="/workers/$id"
              params={{ id: w.id }}
              className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <img src={w.photoUrl} alt="" className="h-12 w-12 rounded-md ring-1 ring-border" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{w.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{w.id}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{w.role} · {w.contractor}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge tone={w.ppeCompliant ? "safe" : "critical"}>{w.ppeCompliant ? "PPE OK" : "PPE !"}</StatusBadge>
                <StatusBadge tone={w.trainingStatus === "completed" ? "safe" : w.trainingStatus === "pending" ? "warning" : "critical"}>{w.trainingStatus}</StatusBadge>
                <StatusBadge tone="info">{exposure} events</StatusBadge>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
