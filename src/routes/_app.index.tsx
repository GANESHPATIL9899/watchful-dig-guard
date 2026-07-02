import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/common/AppShell";
import { KpiCard } from "@/components/common/KpiCard";
import { useDashboardKpis, useMachines, useAlerts, useIncidents } from "@/hooks/data";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { ShieldCheck, Camera, Activity, Cpu, Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

const DEMO_IMAGES = [
  "/images/02e78718-8fc6-42fb-87cb-184ca9a40038.jpeg",
  "/images/3c7d313c-3bc9-48f5-ab59-9a7d90d120ed (1).jpeg",
  "/images/3c7d313c-3bc9-48f5-ab59-9a7d90d120ed.jpeg",
  "/images/e38eb590-5b5c-482b-adec-9349471c3f74.jpeg",
  "/images/133e2b71-fd40-4552-9d32-c2c587e95ea1.jpeg",
  "/images/431f5256-0b8b-45fa-90b3-388a11e6221c.jpeg",
  "/images/4247bd78-7e89-4ca5-a730-7884ccb32342.jpeg",
  "/images/a50bd700-a1f5-46ef-a900-5141af107163.jpeg"
];

export const Route = createFileRoute("/_app/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      node: (search.node as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Site Safety Hub" },
      { name: "description", content: "Real-time overview of construction site safety: machines, workers, alerts, emergency stops, and compliance." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { node: initialNode } = Route.useSearch();
  const [selectedNode, setSelectedNode] = useState<string>(initialNode || "all");
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [loadingSim, setLoadingSim] = useState<boolean>(false);
  const { data: k } = useDashboardKpis();
  const { data: machines = [] } = useMachines();
  const { data: alerts = [] } = useAlerts();
  const { data: incidents = [] } = useIncidents();

  // Sync search param selection
  useEffect(() => {
    if (initialNode) {
      setSelectedNode(initialNode);
    }
  }, [initialNode]);

  // Parse selection
  const isFiltered = selectedNode !== "all";
  const [selectedMachineId, selectedNodeType] = isFiltered ? selectedNode.split(":") : ["", ""];
  const machine = machines.find((m) => m.id === selectedMachineId);

  // Find node inside the selected machine
  const node = machine?.nodes?.find((n) => n.id === selectedNodeType) ?? (
    machine?.id === "EX-2001" || machine?.id === "05" || machine?.id === "MAC-01" ? (selectedNodeType === "node-1" ? { id: "node-1", name: "Node 1 (Front Unit)", cameraStatus: "online" as const, lidarStatus: "online" as const, latestLidarDistance: 8.0, latestCameraImage: "", latestHumanDetected: false } : { id: "node-2", name: "Node 2 (Rear Unit)", cameraStatus: "online" as const, lidarStatus: "online" as const, latestLidarDistance: 8.0, latestCameraImage: "", latestHumanDetected: false }) :
    machine?.id === "EX-2002" || machine?.id === "06" || machine?.id === "MAC-02" ? (selectedNodeType === "node-3" ? { id: "node-3", name: "Node 3 (Front Unit)", cameraStatus: "online" as const, lidarStatus: "online" as const, latestLidarDistance: 8.0, latestCameraImage: "", latestHumanDetected: false } : { id: "node-4", name: "Node 4 (Rear Unit)", cameraStatus: "online" as const, lidarStatus: "online" as const, latestLidarDistance: 8.0, latestCameraImage: "", latestHumanDetected: false }) :
    machine?.id === "EX-2003" || machine?.id === "07" || machine?.id === "MAC-03" ? { id: "node-5", name: "Node 5 (Primary Unit)", cameraStatus: "online" as const, lidarStatus: "online" as const, latestLidarDistance: 8.0, latestCameraImage: "", latestHumanDetected: false } : undefined
  );

  // Filter metrics
  const machineAlerts = alerts.filter(a => a.machineId === selectedMachineId && a.status === "active").length;
  const machineEstops = incidents.filter(i => i.machineId === selectedMachineId && i.emergencyStop).length;

  // Check status on mount
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    fetch(`${baseUrl}/api/simulation/status`)
      .then(res => res.json())
      .then(data => setSimRunning(!!data.running))
      .catch(err => console.error("Error checking simulation status:", err));
  }, []);

  const toggleSimulation = async () => {
    setLoadingSim(true);
    try {
      const endpoint = simRunning ? "/api/simulation/stop" : "/api/simulation/start";
      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
      const res = await fetch(`${baseUrl}${endpoint}`, { method: "POST" });
      const data = await res.json();
      setSimRunning(!!data.running);
    } catch (err) {
      console.error("Error toggling simulation:", err);
    } finally {
      setLoadingSim(false);
    }
  };

  return (
    <AppShell
      title="Executive Dashboard"
      subtitle={
        !isFiltered 
          ? "Live overview of site safety, fleet health and AI detections" 
          : `Live sensor telemetry for machine ${selectedMachineId} · ${node?.name.toUpperCase()}`
      }
      toolbar={
        <div className="flex items-center gap-3">
          <Button 
            variant={simRunning ? "destructive" : "outline"} 
            size="sm" 
            className={`gap-2 ${!simRunning && 'border-safe/50 hover:bg-safe/10 hover:text-safe'}`}
            onClick={toggleSimulation}
            disabled={loadingSim}
          >
            {loadingSim ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : simRunning ? (
              <>
                <Pause className="h-4 w-4 fill-current" /> Stop Simulation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current text-safe" /> Start Simulation
              </>
            )}
          </Button>

          <Select value={selectedNode} onValueChange={setSelectedNode}>
            <SelectTrigger className="w-[300px] bg-card border-border">
              <SelectValue placeholder="Select Node / Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines (Aggregate)</SelectItem>
              {machines.slice(0, 3).map((m) => {
                const machineNodes = m.nodes && m.nodes.length > 0 ? m.nodes : (
                  m.id === "EX-2001" || m.id === "05" || m.id === "MAC-01"
                    ? [{ id: "node-1", name: "Node 1 (Front Unit)" }, { id: "node-2", name: "Node 2 (Rear Unit)" }]
                    : m.id === "EX-2002" || m.id === "06" || m.id === "MAC-02"
                      ? [{ id: "node-3", name: "Node 3 (Front Unit)" }, { id: "node-4", name: "Node 4 (Rear Unit)" }]
                      : [{ id: "node-5", name: "Node 5 (Primary Unit)" }]
                );

                return (
                  <SelectGroup key={m.id}>
                    <SelectLabel className="font-bold text-xs text-info px-2 py-1 mt-1 bg-muted/40 rounded-sm">
                      {m.id} ({m.type.split(" ")[0]})
                    </SelectLabel>
                    {machineNodes.map((n) => (
                      <SelectItem key={n.id} value={`${m.id}:${n.id}`}>
                        ↳ {m.id} - {n.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      }
    >
      {!isFiltered ? null : machine && node ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Selected Unit" value={`${machine.id} - ${node.name}`} icon={Cpu} tone="info" />
          <KpiCard 
            label="Lidar Sensor Distance" 
            value={`${node.latestLidarDistance.toFixed(2)} m`} 
            icon={Activity} 
            tone={node.latestHumanDetected && node.latestLidarDistance < 1.5 ? "critical" : node.latestHumanDetected && node.latestLidarDistance < 3.0 ? "warning" : "safe"} 
          />
          <KpiCard 
            label="AI Safety Status" 
            value={node.latestHumanDetected ? "🚨 Worker Near Machine" : "✅ Area Clear"} 
            icon={ShieldCheck} 
            tone={node.latestHumanDetected ? "critical" : "safe"} 
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Loading node details or node not found...
        </div>
      )}

      <div className="mt-6">
        {isFiltered && node ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col justify-between">
              <div className="border-b border-border px-4 py-3 bg-muted/20">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-critical animate-pulse" /> Live AI Camera Feed
                </p>
                <p className="text-xs text-muted-foreground">{selectedMachineId} · {node.name}</p>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 bg-black/95">
                {(() => {
                  const hasLiveImage = node.latestCameraImage && node.latestCameraImage !== "NULL" && node.latestCameraImage !== "none";
                  const imageUrl = hasLiveImage 
                    ? (node.latestCameraImage.startsWith("data:") ? node.latestCameraImage : `data:image/jpeg;base64,${node.latestCameraImage}`)
                    : (() => {
                        const charSum = (selectedMachineId + node.id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        return DEMO_IMAGES[charSum % DEMO_IMAGES.length];
                      })();
                  return (
                    <img 
                      src={imageUrl} 
                      alt="AI Detection Snapshot" 
                      className="max-h-[320px] object-contain rounded-sm border border-muted-foreground/20 shadow-lg"
                    />
                  );
                })()}
              </div>
              <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-xs">
                <span className="font-semibold text-critical">⚠️ AI Detection Active</span>
                <span className="text-muted-foreground">Proximity: {node.latestLidarDistance.toFixed(2)}m</span>
              </div>
            </div>
            <TrendChart />
          </div>
        ) : (
          <TrendChart />
        )}
      </div>
    </AppShell>
  );
}
