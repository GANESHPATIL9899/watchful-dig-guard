import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ShieldCheck, 
  Loader2, 
  Camera, 
  AlertTriangle, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Video, 
  BarChart3, 
  Shield 
} from "lucide-react";
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

// A custom SVG that matches the safety shield logo with excavator and warning triangle
const SiteSafetyLogo = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Shield */}
    <path
      d="M50 82C50 82 78 69 78 47V25L50 16L22 25V47C22 69 50 82 50 82Z"
      stroke="#1e293b"
      strokeWidth="3.5"
      fill="#1e293b"
      fillOpacity="0.08"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Outline shield dash highlight */}
    <path
      d="M50 82C50 82 78 69 78 47V25L50 16L22 25V47C22 69 50 82 50 82Z"
      stroke="#f97316"
      strokeWidth="1.5"
      strokeDasharray="4 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Wireless signal arcs at the top */}
    <path
      d="M40 12C43 9.5 46.5 8.5 50 8.5C53.5 8.5 57 9.5 60 12"
      stroke="#1e293b"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M34 6C39 2.5 44.5 1.5 50 1.5C55.5 1.5 61 2.5 66 6"
      stroke="#f97316"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Excavator graphic inside shield */}
    <g transform="translate(10, 10)">
      {/* Track Base */}
      <rect x="25" y="44" width="30" height="7" rx="3.5" fill="#1e293b" stroke="#f8fafc" strokeWidth="1" />
      <circle cx="30" cy="47.5" r="1.2" fill="#f8fafc" />
      <circle cx="36" cy="47.5" r="1.2" fill="#f8fafc" />
      <circle cx="44" cy="47.5" r="1.2" fill="#f8fafc" />
      <circle cx="50" cy="47.5" r="1.2" fill="#f8fafc" />

      {/* Cabin / Body */}
      <path d="M28 32H44L48 44H26L28 32Z" fill="#f97316" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M37 34H43L45 42H35L37 34Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1" />
      
      {/* Arm Joints */}
      <circle cx="43" cy="38" r="2.5" fill="#1e293b" />

      {/* Boom */}
      <path d="M43 38L58 20" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M43 38L58 20" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" />

      {/* Dipper / Stick */}
      <path d="M58 20L66 34" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M58 20L66 34" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round" />

      {/* Bucket */}
      <path
        d="M66 34C66 34 69 36 71 39C72.5 41.5 69 43.5 67 43.5C65 43.5 62 40 62 38"
        stroke="#1e293b"
        strokeWidth="2"
        fill="#f97316"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* Danger Warning Sign at the bottom */}
    <polygon points="50,60 41,75 59,75" fill="#f97316" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M50 65V70" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="73" r="1" fill="#f8fafc" />
  </svg>
);

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("supervisor@site.local");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in successfully");
      navigate({ to: "/" });
    } catch {
      toast.error("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-12 overflow-hidden bg-slate-900 font-sans">
      {/* Background Image with faded light/sunset overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center select-none pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      {/* Soft color-cast gradient matching sunset to light overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40 lg:from-white/90 lg:via-white/70 lg:to-white/30" />
      <div className="absolute inset-0 bg-amber-500/5 mix-blend-color" />
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column - Brand Info (Hidden on small screens, shown on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-center py-8 text-[#1e293b] text-center lg:text-left">
          <div className="space-y-6">
            <div className="flex flex-col items-center lg:items-start gap-4">
              <SiteSafetyLogo className="w-24 h-24 drop-shadow-md" />
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  SITE <span className="text-[#f97316]">SAFETY</span>
                </h1>
                <p className="text-sm font-semibold tracking-[0.25em] text-slate-600 mt-2 uppercase">
                  Detect | Prevent | Protect
                </p>
              </div>
            </div>

            {/* Separator line */}
            <div className="w-16 h-1 bg-[#f97316] mx-auto lg:mx-0 rounded-full" />

            <div className="space-y-2 text-xl md:text-2xl font-bold tracking-tight text-slate-800">
              <p>Smart Monitoring.</p>
              <p>Real-Time Alerts.</p>
              <p>Safer Sites, Stronger Tomorrow.</p>
            </div>
          </div>
        </div>

        {/* Right Column - Login Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 flex flex-col items-center">
            
            {/* Card Header logo */}
            <SiteSafetyLogo className="w-18 h-18 mb-4" />
            
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] text-center tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-sm font-medium text-slate-500 text-center mt-1.5 mb-8">
              Please login to continue to your dashboard
            </p>

            <form onSubmit={onSubmit} className="w-full space-y-5">
              {/* Login Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-slate-700">
                  Login
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3 h-12 bg-[#f8fafc] border-slate-200 rounded-xl focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] font-medium text-slate-800 placeholder:text-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 h-12 bg-[#f8fafc] border-slate-200 rounded-xl focus-visible:ring-[#f97316]/20 focus-visible:border-[#f97316] font-medium text-slate-800 placeholder:text-slate-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm pt-1">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#f97316] focus:ring-[#f97316] focus:ring-offset-0 focus:outline-none w-4 h-4 cursor-pointer accent-[#f97316]"
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-sm font-semibold text-slate-600 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <button 
                  type="button" 
                  onClick={() => toast.info("Password reset link sent to registered email")}
                  className="text-sm font-bold text-[#f97316] hover:text-[#ea580c] hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#ff8225] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all duration-200 flex items-center justify-center gap-2 border-0"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Login <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Footer Tip */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 py-2.5 rounded-xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#f97316]" />
                <span>Keep your site safe. Always wear protection.</span>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
