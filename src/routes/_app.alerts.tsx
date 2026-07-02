import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { useAlerts } from "@/hooks/data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, relativeTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Alert } from "@/types";

export const Route = createFileRoute("/_app/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Site Safety Hub" },
      { name: "description", content: "Active and historical real-time safety alerts: worker proximity, danger-zone entry, sensor failures." },
    ],
  }),
  component: AlertsPage,
});

const TAB_FILTER: Record<string, (a: Alert) => boolean> = {
  active: (a) => a.status === "active",
  acknowledged: (a) => a.status === "acknowledged",
  escalated: (a) => a.status === "escalated",
  resolved: (a) => a.status === "resolved",
};

function AlertsPage() {
  const { data = [] } = useAlerts();
  return (
    <AppShell title="Alerts & Notifications" subtitle={`${data.length} alerts in the last 24 hours`}>
      <Tabs defaultValue="active">
        <TabsList>
          {(["active", "acknowledged", "escalated", "resolved"] as const).map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t} ({data.filter(TAB_FILTER[t]).length})</TabsTrigger>
          ))}
        </TabsList>
        {(["active", "acknowledged", "escalated", "resolved"] as const).map((t) => (
          <TabsContent key={t} value={t} className="mt-4 space-y-2">
            {data.filter(TAB_FILTER[t]).map((a) => (
              <AlertRow key={a.id} a={a} />
            ))}
            {data.filter(TAB_FILTER[t]).length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No alerts in this state.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}

function AlertRow({ a }: { a: Alert }) {
  const nodeName = a.nodeId ? a.nodeId.replace("node-", "Node ") : "Node 1";
  return (
    <div 
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => {
        const nId = a.nodeId || "node-1";
        window.location.href = `/?node=${a.machineId}:${nId}`;
      }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 inline-block h-2 w-2 rounded-full" style={{ background: a.severity === "critical" ? "var(--critical)" : a.severity === "high" ? "var(--warning)" : "var(--info)" }} />
        <div>
          <p className="text-sm font-semibold">{a.message}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground font-mono">
            <span>{a.id}</span>
            <span>·</span>
            <span className="text-primary font-bold uppercase">{a.machineId} ({nodeName.toUpperCase()})</span>
            <span>·</span>
            <span className="capitalize">{a.type.replace(/_/g, " ")}</span>
            <span>·</span>
            <span>{relativeTime(a.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <StatusBadge severity={a.severity}>{a.severity}</StatusBadge>
        <StatusBadge alertStatus={a.status}>{a.status}</StatusBadge>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toast.success(`Alert ${a.id} acknowledged`); }}>Acknowledge</Button>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toast.message(`Alert ${a.id} escalated`); }}>Escalate</Button>
        <Button size="sm" onClick={(e) => { e.stopPropagation(); toast.success(`Alert ${a.id} resolved`); }}>Resolve</Button>
      </div>
    </div>
  );
}
