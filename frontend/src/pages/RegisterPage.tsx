import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloudDrizzle, User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwStrength = password.length >= 12 ? "strong" : password.length >= 8 ? "good" : "weak";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-meghblue flex items-center justify-center p-4">
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
          <p className="text-slate-400 text-sm">Create your citizen account</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-6">Create account</h1>

          <form onSubmit={submit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-email"
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
                  id="register-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  placeholder="At least 8 characters"
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
              {/* Password strength bar */}
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {["weak", "good", "strong"].map((level, i) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          ["weak", "good", "strong"].indexOf(pwStrength) >= i
                            ? pwStrength === "strong"
                              ? "bg-emerald-400"
                              : pwStrength === "good"
                              ? "bg-amber-400"
                              : "bg-red-400"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      pwStrength === "strong"
                        ? "text-emerald-400"
                        : pwStrength === "good"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {pwStrength}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className={`w-full bg-white/5 border text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:border-sky-500/50 transition-all ${
                               confirmPw && password !== confirmPw
                                 ? "border-red-500/50 focus:ring-red-500/50"
                                 : confirmPw && password === confirmPw
                                 ? "border-emerald-500/50 focus:ring-emerald-500/50"
                                 : "border-white/10 focus:ring-sky-500/50"
                             }`}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {confirmPw && password === confirmPw && (
                  <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                )}
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
              id="register-submit"
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
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            >
              Sign in
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
