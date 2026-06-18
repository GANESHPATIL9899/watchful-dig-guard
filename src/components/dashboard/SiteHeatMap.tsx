import { useMachines, useIncidents } from "@/hooks/data";
import { StatusBadge } from "@/components/common/StatusBadge";

/**
 * Stylized site overhead map — SVG-based, semantic colors, no external deps.
 * Excavators rendered with their zones; recent incidents shown as pulse dots.
 */
export function SiteHeatMap() {
  const { data: machines = [] } = useMachines();
  const { data: incidents = [] } = useIncidents();
  const recent = incidents.slice(0, 8);

  // Pin machines/incidents on a 720x360 surface using a fixed-seed layout.
  const pin = (i: number, n: number) => ({
    x: 60 + ((i * 137) % (720 - 120)),
    y: 50 + ((i * 73 + n) % (360 - 80)),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Site Safety Heat Map</p>
          <p className="text-xs text-muted-foreground">Excavator positions · live worker proximity · active hazards</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge tone="safe" dot>Safe</StatusBadge>
          <StatusBadge tone="warning" dot>Warning</StatusBadge>
          <StatusBadge tone="critical" dot>Hazard</StatusBadge>
        </div>
      </div>
      <div className="relative">
        <svg viewBox="0 0 720 360" className="block h-[360px] w-full bg-[oklch(0.97_0.01_240)]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="oklch(0.88 0.015 245)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="720" height="360" fill="url(#grid)" />
          {/* Zones */}
          <rect x="40" y="30" width="280" height="150" fill="oklch(0.85 0.05 145 / 0.25)" stroke="oklch(0.6 0.12 145)" strokeDasharray="4 3" />
          <text x="52" y="50" className="fill-foreground" fontSize="11" fontWeight="600">Zone A · North Pit</text>

          <rect x="360" y="30" width="320" height="150" fill="oklch(0.9 0.08 80 / 0.25)" stroke="oklch(0.7 0.15 80)" strokeDasharray="4 3" />
          <text x="372" y="50" className="fill-foreground" fontSize="11" fontWeight="600">Zone B · Trenching</text>

          <rect x="40" y="200" width="640" height="130" fill="oklch(0.92 0.04 250 / 0.4)" stroke="oklch(0.5 0.1 250)" strokeDasharray="4 3" />
          <text x="52" y="220" className="fill-foreground" fontSize="11" fontWeight="600">Zone C · Loading Bay</text>

          {/* Machines */}
          {machines.map((m, i) => {
            const p = pin(i + 1, 0);
            const tone =
              m.status === "maintenance" ? "oklch(0.7 0.04 250)" : m.healthScore < 80 ? "oklch(0.7 0.15 80)" : "oklch(0.5 0.12 250)";
            return (
              <g key={m.id} transform={`translate(${p.x} ${p.y})`}>
                <circle r="14" fill={tone} opacity="0.2" />
                <rect x="-9" y="-7" width="18" height="14" rx="2" fill={tone} />
                <text x="0" y="28" textAnchor="middle" fontSize="9" className="fill-foreground" fontFamily="JetBrains Mono">
                  {m.id}
                </text>
              </g>
            );
          })}

          {/* Recent incidents */}
          {recent.map((inc, i) => {
            const p = pin(i + 3, 7);
            const c =
              inc.riskLevel === "emergency" || inc.riskLevel === "critical"
                ? "oklch(0.6 0.23 25)"
                : inc.riskLevel === "warning"
                  ? "oklch(0.78 0.16 80)"
                  : "oklch(0.62 0.16 145)";
            return (
              <g key={inc.id} transform={`translate(${p.x + 18} ${p.y - 10})`}>
                <circle r="6" fill={c}>
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r="3" fill={c} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
