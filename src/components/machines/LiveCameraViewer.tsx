import { useEffect, useState } from "react";
import { classifyZone, formatDistance, recommendedAction, riskScore } from "@/business/risk";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ZONE_LABEL } from "@/constants";
import type { Machine } from "@/types";
import { Radio } from "lucide-react";

interface Props {
  machine: Machine;
  workerName: string;
}

/**
 * Mock live camera with a worker bounding box that "moves" to simulate
 * proximity changes. No real video stream — prototype only.
 */
export function LiveCameraViewer({ machine, workerName }: Props) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 1500);
    return () => clearInterval(id);
  }, []);

  // Distance oscillates between 1.2m and 9m
  const distance = +(5 + Math.sin(t / 3) * 4).toFixed(2);
  const zone = classifyZone(distance);
  const score = riskScore(distance);

  const boxX = 110 + Math.sin(t / 4) * 60;
  const tint =
    zone === "emergency" ? "#7a1414" : zone === "critical" ? "#b54708" : zone === "warning" ? "#7a5a14" : "#0f3a52";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-critical" />
          <p className="text-sm font-semibold">REAR BLIND-SPOT CAMERA</p>
          <span className="font-mono text-xs text-muted-foreground">{machine.id} · IR</span>
        </div>
        <StatusBadge zone={zone} dot>{ZONE_LABEL[zone]}</StatusBadge>
      </div>

      <div className="relative">
        <svg viewBox="0 0 640 360" className="block aspect-video w-full">
          <defs>
            <linearGradient id="cam" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={tint} />
              <stop offset="1" stopColor="#0a0f1c" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#cam)" />
          {/* IR scan lines */}
          {Array.from({ length: 18 }, (_, i) => (
            <line key={i} x1="0" y1={i * 20} x2="640" y2={i * 20} stroke="rgba(255,255,255,0.05)" />
          ))}
          {/* Blind spot overlay */}
          <polygon points="200,360 440,360 380,120 260,120" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.35)" strokeDasharray="5 4" />
          <text x="320" y="155" textAnchor="middle" fontSize="11" fill="rgba(165,243,252,0.7)" fontFamily="JetBrains Mono">
            BLIND-SPOT MONITORED
          </text>
          {/* Danger zones (concentric) */}
          <ellipse cx="320" cy="360" rx="240" ry="60" fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="1" />
          <ellipse cx="320" cy="360" rx="160" ry="40" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
          <ellipse cx="320" cy="360" rx="80" ry="22" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5" />
          {/* Worker */}
          <g transform={`translate(${boxX} 180)`}>
            <rect x="0" y="0" width="80" height="140" fill="none" stroke={zone === "emergency" || zone === "critical" ? "#f87171" : zone === "warning" ? "#fbbf24" : "#34d399"} strokeWidth="2.5" />
            <circle cx="40" cy="30" r="14" fill="#fde68a" />
            <rect x="22" y="46" width="36" height="50" rx="4" fill="#fb923c" />
            <rect x="22" y="98" width="14" height="40" fill="#1e293b" />
            <rect x="44" y="98" width="14" height="40" fill="#1e293b" />
            <text x="40" y="-6" textAnchor="middle" fontSize="11" fill={zone === "emergency" || zone === "critical" ? "#fecaca" : "#bbf7d0"} fontFamily="JetBrains Mono">
              {workerName.split(" ")[0]} · {formatDistance(distance)}
            </text>
          </g>
          {/* HUD */}
          <text x="14" y="22" fontSize="11" fill="#a7f3d0" fontFamily="JetBrains Mono">
            CAM-01 • {new Date().toLocaleTimeString()}
          </text>
          <text x="14" y="40" fontSize="11" fill="#fde68a" fontFamily="JetBrains Mono">
            LIDAR {distance.toFixed(2)}m • CONF 0.96
          </text>
          <text x="540" y="22" fontSize="11" fill="#fda4af" fontFamily="JetBrains Mono">
            RISK {score}
          </text>
        </svg>
      </div>

      <div className="grid gap-3 border-t border-border bg-muted/40 p-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Distance</p>
          <p className="font-mono text-xl font-semibold">{formatDistance(distance)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Risk Score</p>
          <p className="font-mono text-xl font-semibold">{score}/100</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended Action</p>
          <p className="text-sm font-medium">{recommendedAction(zone)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <Radio className="h-3.5 w-3.5" /> Stream simulated — replace with WebRTC / HLS in production.
      </div>
    </div>
  );
}
