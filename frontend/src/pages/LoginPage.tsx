import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CloudDrizzle, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("admin@meghnetra.in");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-meghblue flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-meghteal/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400 blur-md opacity-50 rounded-full animate-pulse" />
              <CloudDrizzle className="relative w-10 h-10 text-sky-300 drop-shadow-lg" />
            </div>
            <div>
              <div className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-sky-200">
                MEGHNETRA
              </div>
              <div className="text-[10px] font-medium text-sky-400/80 tracking-widest uppercase">
                Eye of the Clouds
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-6">Welcome back</h1>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-meghblue to-meghteal
                         hover:from-meghteal hover:to-meghsky text-white font-semibold py-3 rounded-xl text-sm
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Demo hint */}
          <p className="mt-4 text-center text-xs text-slate-500">
            Demo admin: <span className="text-slate-400 font-mono">admin@meghnetra.in</span> /{" "}
            <span className="text-slate-400 font-mono">admin123</span>
          </p>

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          <Link to="/" className="hover:text-slate-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
