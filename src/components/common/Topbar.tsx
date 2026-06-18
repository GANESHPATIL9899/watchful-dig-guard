import { Bell, LogOut, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/hooks/data";

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function Topbar({ title, subtitle, right }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { data: alerts = [] } = useAlerts();
  const active = alerts.filter((a) => a.status === "active").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/95 px-6 backdrop-blur">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search workers, machines, incidents…" className="h-9 w-72 pl-8 bg-background" />
        </div>
        {right}
        <button
          onClick={() => navigate({ to: "/alerts" })}
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent"
        >
          <Bell className="h-4 w-4" />
          {active > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-semibold text-critical-foreground">
              {active}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user?.name?.[0] ?? "S"}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold">{user?.name ?? "Supervisor"}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{user?.role?.replace("_", " ") ?? "supervisor"}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
