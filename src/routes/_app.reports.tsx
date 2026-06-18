import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/common/AppShell";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, FileBarChart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Site Safety Hub" },
      { name: "description", content: "Generate daily, weekly, monthly and compliance safety reports." },
    ],
  }),
  component: ReportsPage,
});

const REPORTS = [
  { id: "daily", title: "Daily Safety Report", desc: "Last 24h: alerts, incidents, emergency stops" },
  { id: "weekly", title: "Weekly Report", desc: "Rolling 7-day summary across all machines" },
  { id: "monthly", title: "Monthly Report", desc: "Full month KPI dashboard for management" },
  { id: "incident", title: "Incident Report", desc: "Detailed root-cause review of critical events" },
  { id: "worker", title: "Worker Report", desc: "Per-worker exposure, PPE, training status" },
  { id: "machine", title: "Machine Report", desc: "Per-machine sensor health and history" },
  { id: "compliance", title: "Compliance Report", desc: "Regulatory compliance summary" },
];

function ReportsPage() {
  return (
    <AppShell title="Reports Center" subtitle="Generate and export safety reports">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileBarChart className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.desc}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => toast.success(`Generating ${r.title} (PDF)`)}>
                <FileText className="h-3.5 w-3.5" /> PDF
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => toast.success(`Generating ${r.title} (Excel)`)}>
                <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => toast.success(`Generating ${r.title} (CSV)`)}>
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
