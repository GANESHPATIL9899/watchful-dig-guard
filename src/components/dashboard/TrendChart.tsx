import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useDashboardTrend } from "@/hooks/data";

export function TrendChart() {
  const { data: trend = [] } = useDashboardTrend();
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Safety Trend · last 14 days</p>
          <p className="text-xs text-muted-foreground">Daily alerts, incidents and emergency stops</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.16 250)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.55 0.16 250)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.16 80)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.78 0.16 80)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.6 0.23 25)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.6 0.23 25)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 245)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 250)" />
            <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 250)" />
            <Tooltip
              contentStyle={{
                background: "oklch(1 0 0)",
                border: "1px solid oklch(0.9 0.01 245)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area name="Alerts" type="monotone" dataKey="alerts" stroke="oklch(0.55 0.16 250)" strokeWidth={2} fill="url(#g1)" />
            <Area name="Incidents" type="monotone" dataKey="incidents" stroke="oklch(0.78 0.16 80)" strokeWidth={2} fill="url(#g2)" />
            <Area name="E-Stops" type="monotone" dataKey="emergencyStops" stroke="oklch(0.6 0.23 25)" strokeWidth={2} fill="url(#g3)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
