import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in - Site Safety Hub" },
      { name: "description", content: "Sign in to the Site Safety Hub blind-spot safety monitoring console." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("supervisor");
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
    <div
      className="relative min-h-screen overflow-hidden bg-slate-100"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(248,250,252,0.18), rgba(248,250,252,0.78)), url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=85')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 via-white/20 to-white/70" />

      <div className="relative grid min-h-screen items-center gap-8 px-6 py-8 lg:grid-cols-[1fr_560px] lg:px-20">
        <section className="hidden min-h-[720px] flex-col justify-center text-center text-slate-950 lg:flex">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.16)] ring-1 ring-white/80 backdrop-blur">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-900/80">
              <ShieldCheck className="h-12 w-12 text-slate-900" />
              <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-white ring-4 ring-white">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-6xl font-bold tracking-[0.12em] text-slate-950">
              SITE <span className="text-orange-500">SAFETY</span>
            </h1>
            <p className="mt-4 text-xl font-bold tracking-[0.16em] text-slate-900">
              DETECT <span className="text-orange-500">|</span> PREVENT <span className="text-orange-500">|</span> PROTECT
            </p>
            <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-orange-500" />
            <div className="mt-8 space-y-2 text-xl font-medium leading-relaxed text-slate-900">
              <p>Smart Monitoring.</p>
              <p>Real-Time Alerts.</p>
              <p>Safer Sites, Stronger Tomorrow.</p>
            </div>
          </div>

          <div className="mx-auto mt-28 grid w-full max-w-3xl grid-cols-4 rounded-2xl bg-slate-950/20 px-4 py-5 text-white shadow-2xl backdrop-blur-sm">
            {[
              { icon: ShieldCheck, label: "Real-time Monitoring" },
              { icon: AlertTriangle, label: "Instant Alerts" },
              { icon: Camera, label: "Machine Feed" },
              { icon: BarChart3, label: "Safety Analytics" },
            ].map((item) => (
              <div key={item.label} className="border-r border-white/20 px-4 last:border-r-0">
                <item.icon className="mx-auto h-9 w-9 text-orange-400" />
                <p className="mt-3 text-lg font-semibold leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-2xl bg-white/95 px-7 py-8 shadow-[0_24px_90px_rgba(15,23,42,0.2)] ring-1 ring-slate-900/5 backdrop-blur md:px-10 md:py-12">
          <form onSubmit={onSubmit} className="space-y-7">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-900">
                  <ShieldCheck className="h-10 w-10 text-slate-900" />
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-orange-500 text-white ring-2 ring-white">
                    <AlertTriangle className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <h2 className="mt-7 text-3xl font-bold tracking-tight text-slate-950">Welcome Back!</h2>
              <p className="mt-3 text-base text-slate-500">Please login to continue to your dashboard</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold text-slate-950">
                  Login
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your username"
                    className="h-14 rounded-lg border-slate-200 bg-white pl-12 text-base shadow-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold text-slate-950">
                  Password
                </Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-14 rounded-lg border-slate-200 bg-white px-12 text-base shadow-sm placeholder:text-slate-400"
                  />
                  <EyeOff className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-3 text-slate-700">
                  <Checkbox className="h-5 w-5 border-slate-300" />
                  Remember me
                </label>
                <button type="button" className="font-medium text-orange-500 hover:text-orange-600">
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-16 w-full rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 text-lg font-bold shadow-[0_18px_30px_rgba(249,115,22,0.28)] hover:from-orange-500 hover:to-orange-600"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex items-center justify-center gap-2">Sign in <ArrowRight className="h-4 w-4" /></span>}
            </Button>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
              <ShieldCheck className="h-5 w-5 text-orange-400" />
              <span>Keep your site safe. Always wear protection.</span>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
