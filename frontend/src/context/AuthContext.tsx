/**
 * AuthContext — global authentication state for MEGHNETRA.
 *
 * Token is persisted to localStorage under "meghnetra_admin_token"
 * (same key the existing api/client.ts already reads) so the existing
 * JWT attachment interceptor continues to work without modification.
 *
 * On mount the context validates the stored token by calling GET /auth/me.
 * If the server rejects it (expired / revoked) the stored token is cleared.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import client from "../api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "admin";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;          // true while the initial /me check is in flight
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Token storage helpers ────────────────────────────────────────────────────

const TOKEN_KEY = "meghnetra_admin_token";

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
function writeToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(readToken);
  const [loading, setLoading] = useState(true);

  // On mount: validate any stored token via GET /auth/me
  useEffect(() => {
    const stored = readToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        setToken(stored);
      })
      .catch(() => {
        clearToken();
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await client.post("/auth/login", { email, password });
    writeToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await client.post("/auth/register", { name, email, password });
      writeToken(data.token);
      setToken(data.token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await client.post("/auth/logout");
    } catch {
      // best-effort server-side revocation; always clear locally
    }
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
