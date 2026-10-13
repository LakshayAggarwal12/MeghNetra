import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  adminOnly?: boolean;
}

/**
 * AuthGuard — layout-route style guard (renders <Outlet /> on success).
 *
 * Usage in React Router v7:
 *   <Route element={<AuthGuard />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 * With adminOnly:
 *   <Route element={<AuthGuard adminOnly />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 */
export default function AuthGuard({ adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show a full-screen spinner while the initial /auth/me check runs.
  // This prevents flashing the login redirect for returning users.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <span className="text-sm font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Admin Access Required</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
          This area is restricted to administrators. Your current account does not have the
          required permissions.
        </p>
        <a
          href="/dashboard"
          className="mt-2 px-5 py-2.5 rounded-xl bg-meghblue text-white text-sm font-semibold hover:bg-meghteal transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
}
