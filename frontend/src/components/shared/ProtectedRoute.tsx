import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

/**
 * ProtectedRoute wraps any route that requires authentication.
 *
 * - While the initial /auth/me check is in flight, show a spinner
 *   so we never flash the login redirect for a returning user.
 * - On auth failure, redirect to /login preserving the intended destination.
 * - With adminOnly=true, non-admin authenticated users see a 403 message.
 */
export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

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
        <div className="text-4xl">🔒</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Admin Access Required</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
          This area is restricted to administrators. Your current account does not have the required
          permissions.
        </p>
        <a
          href="/dashboard"
          className="mt-2 px-4 py-2 rounded-lg bg-meghblue text-white text-sm font-medium hover:bg-meghteal transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
