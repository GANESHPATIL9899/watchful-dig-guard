import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { KpiCard } from "@/components/common/KpiCard";
import { useDashboardTrend, useIncidents, useMachines, useWorkers } from "@/hooks/data";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Activity, Gauge, Percent, Target, Timer, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Site Safety Hub" },
      { name: "description", content: "Safety performance KPIs, hazard hotspots, detection accuracy and trend analysis." },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.55 0.16 250)", "oklch(0.78 0.16 80)", "oklch(0.6 0.23 25)", "oklch(0.62 0.16 145)", "oklch(0.55 0.15 300)"];

function AnalyticsPage() {
  const { data: trend = [] } = useDashboardTrend();
  const { data: incidents = [] } = useIncidents();
  const { data: machines = [] } = useMachines();
  const { data: workers = [] } = useWorkers();

  const byMachine = machines
    .map((m) => ({ name: m.id, incidents: incidents.filter((i) => i.machineId === m.id).length }))
    .sort((a, b) => b.incidents - a.incidents)
    .slice(0, 6);

  const byWorker = workers
    .map((w) => ({ name: w.name.split(" ")[0], events: incidents.filter((i) => i.workerId === w.id).length }))
    .sort((a, b) => b.events - a.events)
    .slice(0, 6);

  const zoneDist = (["safe", "warning", "critical", "emergency"] as const).map((z) => ({
    name: z,
    value: incidents.filter((i) => i.riskLevel === z).length,
  }));

  return (
    <AppShell title="Analytics" subtitle="Safety performance, hazards and AI detection metrics">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Avg Worker Distance" value="6.4 m" icon={Gauge} tone="info" />
        <KpiCard label="Avg Response Time" value="0.8 s" icon={Timer} tone="safe" />
        <KpiCard label="Detection Accuracy" value="97.2%" icon={Target} tone="safe" />
        <KpiCard label="False Positive Rate" value="1.4%" icon={Percent} tone="warning" />
        <KpiCard label="System Uptime" value="99.6%" icon={Activity} tone="safe" />
        <KpiCard label="Compliance" value="96%" icon={ShieldCheck} tone="safe" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Most Dangerous Machines" subtitle="Incidents per machine">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byMachine}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 245)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="incidents" fill="oklch(0.55 0.16 250)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Workers Near Hazard" subtitle="Detection events by worker">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byWorker} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 245)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="events" fill="oklch(0.78 0.16 80)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk Zone Distribution" subtitle="All detections classified">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={zoneDist} dataKey="value" nameKey="name" outerRadius={90} label={{ fontSize: 11 }}>
                {zoneDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Compliance Trend" subtitle="14-day safety compliance %">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 245)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="compliance" stroke="oklch(0.62 0.16 145)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </AppShell>
  );
}

const tooltipStyle = {
  background: "oklch(1 0 0)",
  border: "1px solid oklch(0.9 0.01 245)",
  borderRadius: 8,
  fontSize: 12,
} as const;

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
