+import { createFileRoute, useNavigate } from "@tanstack/reac
         t-router";
      2 +import { useState } from "react";
      3 +import {
      4 +  AlertTriangle,
      5 +  ArrowRight,
      6 +  BarChart3,
      7 +  Camera,
      8 +  EyeOff,
      9 +  Loader2,
     10 +  LockKeyhole,
     11 +  ShieldCheck,
     12 +  User,
     13 +} from "lucide-react";
     14 +import { Button } from "@/components/ui/button";
     15 +import { Checkbox } from "@/components/ui/checkbox";
     16 +import { Input } from "@/components/ui/input";
     17 +import { Label } from "@/components/ui/label";
     18 +import { useAuthStore } from "@/store/auth";
     19 +import { toast } from "sonner";
     20 +
     21 +export const Route = createFileRoute("/login")({
     22 +  head: () => ({
     23 +    meta: [
     24 +      { title: "Sign in - Site Safety Hub" },
     25 +      { name: "description", content: "Sign in to the Site S
         afety Hub blind-spot safety monitoring console." },
     26 +    ],
     27 +  }),
     28 +  component: LoginPage,
     29 +});
     30 +
     31 +function LoginPage() {
     32 +  const navigate = useNavigate();
     33 +  const login = useAuthStore((s) => s.login);
     34 +  const [email, setEmail] = useState("supervisor");
     35 +  const [password, setPassword] = useState("demo1234");
     36 +  const [loading, setLoading] = useState(false);
     37 +
     38 +  async function onSubmit(e: React.FormEvent) {
     39 +    e.preventDefault();
     40 +    setLoading(true);
     41 +    try {
     42 +      await login(email, password);
     43 +      toast.success("Signed in");
     44 +      navigate({ to: "/" });
     45 +    } catch {
     46 +      toast.error("Sign in failed");
     47 +    } finally {
     48 +      setLoading(false);
     49 +    }
     50 +  }
     51 +
     52 +  return (
     53 +    <div
     54 +      className="relative min-h-screen overflow-hidden bg-sl
         ate-100"
     55 +      style={{
     56 +        backgroundImage:
     57 +          "linear-gradient(90deg, rgba(248,250,252,0.18), rg
         ba(248,250,252,0.78)), url('https://images.unsplash.com/phot
         o-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=85')
         ",
     58 +        backgroundPosition: "center",
     59 +        backgroundSize: "cover",
     60 +      }}
     61 +    >
     62 +      <div className="absolute inset-0 bg-gradient-to-r from
         -slate-950/10 via-white/20 to-white/70" />
     63 +
     64 +      <div className="relative grid min-h-screen items-cente
         r gap-8 px-6 py-8 lg:grid-cols-[1fr_560px] lg:px-20">
     65 +        <section className="hidden min-h-[720px] flex-col ju
         stify-center text-center text-slate-950 lg:flex">
     66 +          <div className="mx-auto flex h-28 w-28 items-cente
         r justify-center rounded-full bg-white/75 shadow-[0_24px_80p
         x_rgba(15,23,42,0.16)] ring-1 ring-white/80 backdrop-blur">
     67 +            <div className="relative flex h-20 w-20 items-ce
         nter justify-center rounded-full border-2 border-slate-900/8
         0">
     68 +              <ShieldCheck className="h-12 w-12 text-slate-9
         00" />
     69 +              <span className="absolute -bottom-1 -right-1 g
         rid h-8 w-8 place-items-center rounded-full bg-orange-500 te
         xt-white ring-4 ring-white">
     70 +                <AlertTriangle className="h-4 w-4" />
     71 +              </span>
     72 +            </div>
     73 +          </div>
     74 +
     75 +          <div className="mt-8">
     76 +            <h1 className="text-6xl font-bold tracking-[0.12
         em] text-slate-950">
     77 +              SITE <span className="text-orange-500">SAFETY<
         /span>
     78 +            </h1>
     79 +            <p className="mt-4 text-xl font-bold tracking-[0
         .16em] text-slate-900">
     80 +              DETECT <span className="text-orange-500">|</sp
         an> PREVENT <span className="text-orange-500">|</span> PROTE
         CT
     81 +            </p>
     82 +            <div className="mx-auto mt-8 h-1 w-16 rounded-fu
         ll bg-orange-500" />
     83 +            <div className="mt-8 space-y-2 text-xl font-medi
         um leading-relaxed text-slate-900">
     84 +              <p>Smart Monitoring.</p>
     85 +              <p>Real-Time Alerts.</p>
     86 +              <p>Safer Sites, Stronger Tomorrow.</p>
     87 +            </div>
     88 +          </div>
     89 +
     90 +          <div className="mx-auto mt-28 grid w-full max-w-3x
         l grid-cols-4 rounded-2xl bg-slate-950/20 px-4 py-5 text-whi
         te shadow-2xl backdrop-blur-sm">
     91 +            {[
     92 +              { icon: ShieldCheck, label: "Real-time Monitor
         ing" },
     93 +              { icon: AlertTriangle, label: "Instant Alerts"
          },
     94 +              { icon: Camera, label: "Machine Feed" },
     95 +              { icon: BarChart3, label: "Safety Analytics" }
         ,
     96 +            ].map((item) => (
     97 +              <div key={item.label} className="border-r bord
         er-white/20 px-4 last:border-r-0">
     98 +                <item.icon className="mx-auto h-9 w-9 text-o
         range-400" />
     99 +                <p className="mt-3 text-lg font-semibold lea
         ding-tight">{item.label}</p>
    100 +              </div>
    101 +            ))}
    102 +          </div>
    103 +        </section>
    104 +
    105 +        <section className="mx-auto w-full max-w-xl rounded-
         2xl bg-white/95 px-7 py-8 shadow-[0_24px_90px_rgba(15,23,42,
         0.2)] ring-1 ring-slate-900/5 backdrop-blur md:px-10 md:py-1
         2">
    106 +          <form onSubmit={onSubmit} className="space-y-7">
    107 +            <div className="text-center">
    108 +              <div className="mx-auto flex h-24 w-24 items-c
         enter justify-center rounded-full bg-slate-50 ring-1 ring-sl
         ate-200">
    109 +                <div className="relative flex h-16 w-16 item
         s-center justify-center rounded-full border-2 border-slate-9
         00">
    110 +                  <ShieldCheck className="h-10 w-10 text-sla
         te-900" />
    111 +                  <span className="absolute -bottom-1 -right
         -1 grid h-6 w-6 place-items-center rounded-full bg-orange-50
         0 text-white ring-2 ring-white">
    112 +                    <AlertTriangle className="h-3 w-3" />
    113 +                  </span>
    114 +                </div>
    115 +              </div>
    116 +              <h2 className="mt-7 text-3xl font-bold trackin
         g-tight text-slate-950">Welcome Back!</h2>
    117 +              <p className="mt-3 text-base text-slate-500">P
         lease login to continue to your dashboard</p>
    118 +            </div>
    119 +
    120 +            <div className="space-y-5">
    121 +              <div className="space-y-2">
    122 +                <Label htmlFor="email" className="text-base
         font-semibold text-slate-950">
    123 +                  Login
    124 +                </Label>
    125 +                <div className="relative">
    126 +                  <User className="pointer-events-none absol
         ute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
         />
    127 +                  <Input
    128 +                    id="email"
    129 +                    required
    130 +                    value={email}
    131 +                    onChange={(e) => setEmail(e.target.value
         )}
    132 +                    placeholder="Enter your username"
    133 +                    className="h-14 rounded-lg border-slate-
         200 bg-white pl-12 text-base shadow-sm placeholder:text-slat
         e-400"
    134 +                  />
    135 +                </div>
    136 +              </div>
    137 +
    138 +              <div className="space-y-2">
    139 +                <Label htmlFor="password" className="text-ba
         se font-semibold text-slate-950">
    140 +                  Password
    141 +                </Label>
    142 +                <div className="relative">
    143 +                  <LockKeyhole className="pointer-events-non
         e absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slat
         e-400" />
    144 +                  <Input
    145 +                    id="password"
    146 +                    type="password"
    147 +                    required
    148 +                    value={password}
    149 +                    onChange={(e) => setPassword(e.target.va
         lue)}
    150 +                    placeholder="Enter your password"
    151 +                    className="h-14 rounded-lg border-slate-
         200 bg-white px-12 text-base shadow-sm placeholder:text-slat
         e-400"
    152 +                  />
    153 +                  <EyeOff className="pointer-events-none abs
         olute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-40
         0" />
    154 +                </div>
    155 +              </div>
    156 +
    157 +              <div className="flex items-center justify-betw
         een gap-4 text-sm">
    158 +                <label className="flex items-center gap-3 te
         xt-slate-700">
    159 +                  <Checkbox className="h-5 w-5 border-slate-
         300" />
    160 +                  Remember me
    161 +                </label>
    162 +                <button type="button" className="font-medium
          text-orange-500 hover:text-orange-600">
    163 +                  Forgot Password?
    164 +                </button>
    165 +              </div>
    166 +            </div>
    167 +
    168 +            <Button
    169 +              type="submit"
    170 +              disabled={loading}
    171 +              className="h-16 w-full rounded-lg bg-gradient-
         to-r from-orange-400 to-orange-600 text-lg font-bold shadow-
         [0_18px_30px_rgba(249,115,22,0.28)] hover:from-orange-500 ho
         ver:to-orange-600"
    172 +            >
    173 +              {loading ? (
    174 +                <Loader2 className="h-5 w-5 animate-spin" />
    179 +                </>
    180 +              )}
    181 +            </Button>
    182 +
    183 +            <div className="flex items-center gap-4 text-sm
         text-slate-400">
    184 +              <div className="h-px flex-1 bg-slate-200" />
    185 +              <span>or</span>
    186 +              <div className="h-px flex-1 bg-slate-200" />
    187 +            </div>
    188 +
    189 +            <div className="flex items-center justify-center
          gap-3 text-sm text-slate-500">
    190 +              <ShieldCheck className="h-5 w-5 text-orange-40
         0" />
    191 +              <span>Keep your site safe. Always wear protect
         ion.</span>
    192 +            </div>
    193 +          </form>
    194 +        </section>
    195 +      </div>
    196 +    </div>
    197 +  );
    198 +}
