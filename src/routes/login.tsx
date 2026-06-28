import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Loader2, Camera, Radar, Cpu, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Site Safety Hub" },
      { name: "description", content: "Sign in to the Site Safety Hub blind-spot safety monitoring console." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("supervisor@site.local");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      navigate({ to: "/" });
    } catch {
      toast.error("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.45 0.18 250 / 0.4), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.55 0.2 30 / 0.25), transparent 45%)" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/30">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary-foreground">Site Safety Hub</p>
              <p className="text-xs uppercase tracking-wider text-sidebar-foreground/70">AI Blind-Spot Monitoring</p>
            </div>
          </div>
        </div>
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-primary-foreground">
              Protect every worker behind every excavator.
            </h2>
            <p className="mt-3 max-w-md text-sm text-sidebar-foreground/80">
              Real-time AI detection. LiDAR-verified proximity. Automatic hydraulic shutdown.
              One console for every site, every machine, every worker.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {[
              { icon: Camera, t: "IR Vision", d: "24/7 worker detection" },
              { icon: Radar, t: "TF-Luna LiDAR", d: "Centimeter-level distance" },
              { icon: Cpu, t: "Edge AI", d: "YOLOv8 on Raspberry Pi 5" },
              { icon: Lock, t: "Fail-Safe Stop", d: "Hydraulic interrupt" },
            ].map((f) => (
              <div key={f.t} className="rounded-lg border border-sidebar-border/60 bg-sidebar-accent/30 p-3">
                <f.icon className="h-4 w-4 text-primary-foreground" />
                <p className="mt-2 font-semibold text-primary-foreground">{f.t}</p>
                <p className="text-sidebar-foreground/70">{f.d}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[11px] text-sidebar-foreground/50">
            v0.9.0 · UI Prototype · mock data mode
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-info">Supervisor Console</p>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in as Supervisor</h1>
            <p className="text-sm text-muted-foreground">
              Restricted to site supervisors. Use any email / password — prototype runs on mock authentication.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-info hover:underline">
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>

          <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demo accounts</p>
            <p className="font-mono">supervisor@site.local · safety@site.local</p>
            <p>Any password works in prototype mode.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
