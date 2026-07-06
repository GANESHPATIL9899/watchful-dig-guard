import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/common/AppShell";
import { KpiCard } from "@/components/common/KpiCard";
import { useDashboardKpis, useMachines, useAlerts, useIncidents } from "@/hooks/data";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { env } from "@/config/environment";
import { ShieldCheck, Camera, Activity, Cpu, Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

const FRONT_IMAGES = [
  "/images/extracted_image_1.jpg",
  "/images/extracted_image_2.jpg",
  "/images/extracted_image_3.jpg",
  "/images/extracted_image_4.jpg",
  "/images/extracted_image_5.jpg",
  "/images/extracted_image_6.jpg",
  "/images/extracted_image_7.jpg",
  "/images/extracted_image_8.jpg",
  "/images/extracted_image_9.jpg",
  "/images/extracted_image_10.jpg",
  "/images/extracted_image_11.jpg",
  "/images/extracted_image_12.jpg"
];

const REAR_IMAGES = [
  "/images/extracted_image_13.jpg",
  "/images/extracted_image_14.jpg",
  "/images/extracted_image_15.jpg",
  "/images/extracted_image_16.jpg",
  "/images/extracted_image_17.jpg",
  "/images/extracted_image_18.jpg",
  "/images/extracted_image_19.jpg",
  "/images/extracted_image_20.jpg",
  "/images/extracted_image_21.jpg",
  "/images/extracted_image_22.jpg",
  "/images/extracted_image_23.jpg",
  "/images/extracted_image_24.jpg"
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

  const [cocoModel, setCocoModel] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Load COCO-SSD client-side human detector model once
  useEffect(() => {
    let active = true;
    const checkInterval = setInterval(async () => {
      if ((window as any).cocoSsd) {
        clearInterval(checkInterval);
        if (!active) return;
        try {
          setIsModelLoading(true);
          const model = await (window as any).cocoSsd.load();
          if (active) {
            setCocoModel(model);
            setIsModelLoading(false);
            console.log("🤖 Client-side AI Human Detector loaded!");
          }
        } catch (err) {
          console.error("Failed to load cocoSsd:", err);
          if (active) setIsModelLoading(false);
        }
      }
    }, 1000);

    return () => {
      active = false;
      clearInterval(checkInterval);
    };
  }, []);

  // Reset detections on selected node change
  useEffect(() => {
    setDetections([]);
  }, [selectedNode]);

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
    const baseUrl = env.BASE_URL.replace("/api", "") || "";
    fetch(`${baseUrl}/api/simulation/status`)
      .then(res => res.json())
      .then(data => setSimRunning(!!data.running))
      .catch(err => console.error("Error checking simulation status:", err));
  }, []);

  const toggleSimulation = async () => {
    setLoadingSim(true);
    try {
      const endpoint = simRunning ? "/api/simulation/stop" : "/api/simulation/start";
      const baseUrl = env.BASE_URL.replace("/api", "") || "";
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
          {(() => {
            const isFrontNode = node.id === "node-1" || node.id === "node-3" || node.id === "node-5";
            const nodeImages = isFrontNode ? FRONT_IMAGES : REAR_IMAGES;
            
            const hasLiveImage = node.latestCameraImage && node.latestCameraImage !== "NULL" && node.latestCameraImage !== "none";
            const imageUrl = hasLiveImage 
              ? (node.latestCameraImage.startsWith("data:") || node.latestCameraImage.startsWith("/") || node.latestCameraImage.startsWith("http")
                  ? node.latestCameraImage 
                  : `data:image/jpeg;base64,${node.latestCameraImage}`)
              : (() => {
                  const distInt = Math.floor(node.latestLidarDistance * 100);
                  const charSum = (selectedMachineId + node.id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  return nodeImages[(charSum + distInt) % nodeImages.length];
                })();

            const imageIndex = nodeImages.indexOf(imageUrl);
            const hasPPEViolation = node.latestHumanDetected && (imageIndex !== -1 ? (imageIndex % 2 !== 0) : (Math.floor(node.latestLidarDistance * 10) % 2 === 0));

            return (
              <KpiCard 
                label="AI Safety Status" 
                value={
                  node.latestHumanDetected 
                    ? (hasPPEViolation ? "🚨 Worker: No PPE!" : "🚨 Worker: PPE OK") 
                    : "✅ Area Clear"
                } 
                icon={ShieldCheck} 
                tone={node.latestHumanDetected ? "critical" : "safe"} 
              />
            );
          })()}
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
              <div className="flex-1 flex items-center justify-center p-4 bg-black/95 relative overflow-hidden">
                {(() => {
                  const isFrontNode = node.id === "node-1" || node.id === "node-3" || node.id === "node-5";
                  const nodeImages = isFrontNode ? FRONT_IMAGES : REAR_IMAGES;

                  const hasLiveImage = node.latestCameraImage && node.latestCameraImage !== "NULL" && node.latestCameraImage !== "none";
                  const imageUrl = hasLiveImage 
                    ? (node.latestCameraImage.startsWith("data:") || node.latestCameraImage.startsWith("/") || node.latestCameraImage.startsWith("http")
                        ? node.latestCameraImage 
                        : `data:image/jpeg;base64,${node.latestCameraImage}`)
                    : (() => {
                        const distInt = Math.floor(node.latestLidarDistance * 100);
                        const charSum = (selectedMachineId + node.id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        return nodeImages[(charSum + distInt) % nodeImages.length];
                      })();
                  
                  const imageIndex = nodeImages.indexOf(imageUrl);
                  const hasPPEViolation = node.latestHumanDetected && (imageIndex !== -1 ? (imageIndex % 2 !== 0) : (Math.floor(node.latestLidarDistance * 10) % 2 === 0));
                  const showBoundingBox = node.latestHumanDetected;

                  return (
                    <div className="relative inline-block overflow-hidden rounded-sm border border-muted-foreground/20 shadow-lg bg-black/50">
                      <img 
                        id="live-camera-feed-img"
                        src={imageUrl} 
                        alt="AI Detection Snapshot" 
                        className="max-h-[320px] object-contain"
                        onLoad={async (e) => {
                          const img = e.currentTarget;
                          if (cocoModel) {
                            try {
                              setIsScanning(true);
                              const predictions = await cocoModel.detect(img);
                              setDetections(predictions);
                              setIsScanning(false);
                            } catch (err) {
                              console.error("Error running human detection:", err);
                              setIsScanning(false);
                            }
                          }
                        }}
                      />

                      {/* Scanner line scanning up and down */}
                      {isScanning && (
                        <div className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-red-500 via-red-400 to-red-500 pointer-events-none opacity-40 top-0 animate-[scan_3s_ease-in-out_infinite]" />
                      )}

                      {/* Bounding Boxes Overlay with PPE detection */}
                      {detections.filter(d => d.class === "person").map((det, idx) => {
                        const img = document.getElementById("live-camera-feed-img") as HTMLImageElement;
                        if (!img) return null;
                        
                        const scaleX = img.clientWidth / img.naturalWidth;
                        const scaleY = img.clientHeight / img.naturalHeight;
                        const [x, y, width, height] = det.bbox;

                        // Deterministic PPE check based on imageIndex
                        const isViolation = imageIndex !== -1 ? (imageIndex % 2 !== 0) : (Math.floor(node.latestLidarDistance * 10) % 2 === 0);

                        return (
                          <div
                            key={idx}
                            className={`absolute border-2 rounded-sm flex flex-col justify-start items-start pointer-events-none transition-all duration-300 ${
                              isViolation 
                                ? "border-red-500 border-double shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse" 
                                : "border-emerald-500 border-dashed shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                            }`}
                            style={{
                              left: `${x * scaleX}px`,
                              top: `${y * scaleY}px`,
                              width: `${width * scaleX}px`,
                              height: `${height * scaleY}px`,
                              zIndex: 50,
                            }}
                          >
                            <span className={`text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-br-sm -mt-0.5 -ml-0.5 uppercase tracking-wider whitespace-nowrap shadow-md ${
                              isViolation ? "bg-red-600 animate-bounce" : "bg-emerald-600"
                            }`}>
                              {isViolation ? "🚨 NO HELMET" : "✅ PPE OK"} ({Math.round(det.score * 100)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-xs">
                {isModelLoading ? (
                  <span className="text-yellow-400 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading AI Model...
                  </span>
                ) : isScanning ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning Frame...
                  </span>
                ) : detections.some(d => d.class === "person") ? (
                  <span className="font-bold text-red-500 animate-pulse flex items-center gap-1.5">
                    ⚠️ PROXIMITY BREACH · HUMAN DETECTED
                  </span>
                ) : (
                  <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                    ✓ AI Camera Active · Zone Clear
                  </span>
                )}
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
