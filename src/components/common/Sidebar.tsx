import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  Image as ImageIcon,
  Users,
  AlertTriangle,
  Bell,
  BarChart3,
  Truck,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Executive Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/live", label: "Live Monitoring", icon: Radio },
  { to: "/evidence", label: "Evidence Center", icon: ImageIcon },
  { to: "/workers", label: "Workers", icon: Users },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/machines", label: "Fleet", icon: Truck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-primary-foreground">Site Safety Hub</p>
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70">Blind-Spot AI</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4 text-[11px] text-sidebar-foreground/60">
        <div className="flex items-center gap-2">
          <span className="status-dot bg-safe animate-pulse" />
          All systems nominal
        </div>
        <p className="mt-1 font-mono">v0.9.0 · prototype</p>
      </div>
    </aside>
  );
}
