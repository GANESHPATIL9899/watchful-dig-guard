import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Loader2, User, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, Video, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import heroImage from "@/assets/login-hero.jpg";

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
  const [username, setUsername] = useState("supervisor");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const email = username.includes("@") ? username : `${username}@site.local`;
      await login(email, password);
      toast.success("Signed in");
      navigate({ to: "/" });
    } catch {
      toast.error("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: ShieldCheck, label: "Real-time\nMonitoring" },
    { icon: AlertTriangle, label: "Instant\nAlerts" },
    { icon: Video, label: "Live Feed\nMonitoring" },
    { icon: BarChart3, label: "Safety\nAnalytics" },
  ];

  return (
    <div className="grid min-h-screen bg-[oklch(0.98_0.005_240)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={heroImage}
          alt="Construction site with excavator and worker"
          className="absolute inset-0 h-full w-full object-cover"
          width={1280}
          height={1600}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/80" />
        <div className="relative flex h-full flex-col items-center justify-between px-10 py-16 text-center">
          <div className="flex flex-col items-center">
            <BrandLogo className="h-28 w-28" />
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight">
              <span className="text-[#16284a]">SITE </span>
              <span className="text-[#f08a2a]">SAFETY</span>
            </h1>
            <p className="mt-3 flex items-center gap-3 text-sm font-bold tracking-[0.2em] text-[#16284a]">
              <span>DETECT</span>
              <span className="text-[#f08a2a]">|</span>
              <span>PREVENT</span>
              <span className="text-[#f08a2a]">|</span>
              <span>PROTECT</span>
            </p>
            <div className="mt-5 h-0.5 w-16 bg-[#f08a2a]" />
            <p className="mt-5 text-lg leading-relaxed text-[#3a4a66]">
              Smart Monitoring.<br />
              Real-Time Alerts.<br />
              Safer Sites, Stronger Tomorrow.
            </p>
          </div>
          <div className="grid w-full max-w-md grid-cols-4 gap-2 border-t border-[#16284a]/15 pt-6">
            {features.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2">
                <f.icon className="h-7 w-7 text-[#f08a2a]" strokeWidth={2.2} />
                <p className="whitespace-pre-line text-xs font-semibold leading-tight text-[#16284a]">
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center px-6 py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0.85 0.02 250) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <form
          onSubmit={onSubmit}
          className="relative w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-10 shadow-[0_30px_80px_-30px_oklch(0.2_0.05_255/0.3)] backdrop-blur"
        >
          <div className="flex flex-col items-center text-center">
            <BrandLogo className="h-20 w-20" />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#16284a]">
              Welcome Back!
            </h2>
            <p className="mt-1 text-sm text-[#5a6a82]">
              Please login to continue to your dashboard
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-[#16284a]">
                Login
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a98ad]" />
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="h-12 rounded-lg border-[#e1e6ee] bg-white pl-10 text-sm shadow-none focus-visible:ring-[#f08a2a]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-[#16284a]">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a98ad]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 rounded-lg border-[#e1e6ee] bg-white pl-10 pr-10 text-sm shadow-none focus-visible:ring-[#f08a2a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a98ad] hover:text-[#16284a]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-[#5a6a82]">
                <Checkbox id="remember" className="border-[#cdd5e0] data-[state=checked]:border-[#f08a2a] data-[state=checked]:bg-[#f08a2a]" />
                <span>Remember me</span>
              </label>
              <button type="button" className="font-semibold text-[#f08a2a] hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[#f08a2a] text-base font-semibold text-white shadow-[0_10px_24px_-8px_oklch(0.65_0.18_45/0.6)] hover:bg-[#e07a1a]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Login <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>

            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-[#e1e6ee]" />
              <span className="text-xs text-[#8a98ad]">or</span>
              <div className="h-px flex-1 bg-[#e1e6ee]" />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#5a6a82]">
              <ShieldCheck className="h-4 w-4 text-[#f08a2a]" />
              <span>Keep your site safe. Always wear protection.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function BrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden>
      <path
        d="M48 6 L84 18 V46 C84 68 68 84 48 90 C28 84 12 68 12 46 V18 Z"
        fill="#16284a"
      />
      <path
        d="M48 10 L80 21 V46 C80 66 66 80 48 86 C30 80 16 66 16 46 V21 Z"
        fill="none"
        stroke="#f08a2a"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle cx="30" cy="22" r="2" fill="#f08a2a" />
      <circle cx="66" cy="22" r="2" fill="#f08a2a" />
      <path d="M30 22 Q48 14 66 22" stroke="#f08a2a" strokeWidth="1.2" fill="none" />
      <path d="M34 50 L42 42 L56 42 L62 50 L62 58 L34 58 Z" fill="#f08a2a" />
      <rect x="42" y="36" width="14" height="8" fill="#f08a2a" />
      <path
        d="M48 56 L52 64 L44 64 Z"
        fill="#f08a2a"
      />
      <rect x="47" y="58" width="2" height="3" fill="#16284a" />
      <circle cx="48" cy="63" r="0.8" fill="#16284a" />
    </svg>
  );
}
