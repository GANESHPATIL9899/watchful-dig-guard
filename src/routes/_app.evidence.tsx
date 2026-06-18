import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useEvidence } from "@/hooks/data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/utils/format";
import { formatDistance, classifyZone } from "@/business/risk";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EvidenceImage } from "@/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence Center — Site Safety Hub" },
      { name: "description", content: "Captured images for every AI worker-detection event with full metadata." },
    ],
  }),
  component: EvidencePage,
});

function EvidencePage() {
  const { data = [] } = useEvidence();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<EvidenceImage | null>(null);
  const filtered = data.filter((e) =>
    [e.workerId, e.machineId, e.alertType].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Captured Evidence Center"
      subtitle={`${data.length} AI detection snapshots stored`}
      toolbar={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="h-9 w-56 pl-8 bg-background" />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((e) => {
          const zone = classifyZone(e.distanceM);
          return (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className="group overflow-hidden rounded-lg border border-border bg-card text-left transition-shadow hover:shadow-md"
            >
              <img src={e.imageUrl} alt="" className="aspect-video w-full object-cover" />
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
                  <StatusBadge zone={zone} dot>{zone}</StatusBadge>
                </div>
                <p className="text-sm font-semibold">{e.alertType}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{e.workerId} · {e.machineId}</span>
                  <span className="font-mono">{formatDistance(e.distanceM)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{formatDateTime(e.capturedAt)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono">{selected.id} · {selected.alertType}</DialogTitle>
              </DialogHeader>
              <img src={selected.imageUrl} alt="" className="w-full rounded-md border border-border" />
              <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <Field k="Captured" v={formatDateTime(selected.capturedAt)} />
                <Field k="Worker" v={<span className="font-mono">{selected.workerId}</span>} />
                <Field k="Machine" v={<span className="font-mono">{selected.machineId}</span>} />
                <Field k="Distance" v={<span className="font-mono">{formatDistance(selected.distanceM)}</span>} />
                <Field k="Confidence" v={<span className="font-mono">{(selected.confidence * 100).toFixed(0)}%</span>} />
                <Field k="Emergency Stop" v={<StatusBadge tone={selected.emergencyStop ? "critical" : "muted"}>{selected.emergencyStop ? "engaged" : "not triggered"}</StatusBadge>} />
              </dl>
              {selected.notes && <p className="text-sm text-muted-foreground">Notes: {selected.notes}</p>}
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
