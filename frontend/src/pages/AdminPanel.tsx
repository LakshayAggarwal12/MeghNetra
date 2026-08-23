import React, { useEffect, useState } from "react";
import { LogOut, ClipboardList, ScrollText, LockKeyhole } from "lucide-react";
import client from "../api/client";
import { getSocket } from "../sockets/socket";
import ReportQueueTable from "../components/admin/ReportQueueTable";
import type { WeatherEvent, AuditLog } from "../types/models";

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@meghnetra.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await client.post("/auth/login", { email, password });
      localStorage.setItem("meghnetra_admin_token", data.token);
      onLogin();
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8 bg-white dark:bg-meghcard-dark rounded-xl shadow-card
                    border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-meghblue/10 dark:bg-sky-400/10 text-meghblue dark:text-sky-300">
          <LockKeyhole className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold text-meghblue dark:text-sky-300">Admin Login</h1>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-meghteal transition-surface"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                     text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-meghteal transition-surface"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-xs text-red-500">{error}</div>}
        <button className="w-full bg-meghblue text-white text-sm font-medium px-3 py-2.5 rounded-lg
                           hover:bg-meghteal transition-surface">
          Log in
        </button>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">Demo credentials: admin@meghnetra.in / admin123</p>
      </form>
    </div>
  );
}

function AdminQueue() {
  const [queue, setQueue] = useState<WeatherEvent[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [tab, setTab] = useState<"queue" | "audit">("queue");

  const fetchQueue = () => {
    client.get("/admin/queue").then(({ data }) => setQueue(data.queue)).catch(() => {});
  };
  const fetchLogs = () => {
    client.get("/admin/audit-logs").then(({ data }) => setLogs(data.logs)).catch(() => {});
  };

  useEffect(() => {
    fetchQueue();
    fetchLogs();
    const socket = getSocket();
    socket.on("admin:queue-update", fetchQueue);
    return () => {
      socket.off("admin:queue-update", fetchQueue);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("meghnetra_admin_token");
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-surface"
        >
          <LogOut className="w-3.5 h-3.5" /> Log out
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("queue")}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-surface ${
            tab === "queue"
              ? "bg-meghblue text-white shadow-card"
              : "bg-white dark:bg-meghcard-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Review Queue ({queue.length})
        </button>
        <button
          onClick={() => setTab("audit")}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-surface ${
            tab === "audit"
              ? "bg-meghblue text-white shadow-card"
              : "bg-white dark:bg-meghcard-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          }`}
        >
          <ScrollText className="w-4 h-4" /> Audit Log
        </button>
      </div>

      {tab === "queue" && (
        <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-2">
          <ReportQueueTable queue={queue} />
        </div>
      )}

      {tab === "audit" && (
        <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                <th className="py-2 px-2">Time</th>
                <th className="px-2">Actor</th>
                <th className="px-2">Action</th>
                <th className="px-2">Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                  <td className="py-2.5 px-2 text-xs text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-2 text-xs text-slate-600 dark:text-slate-300">{log.actor}</td>
                  <td className="px-2 text-xs font-medium text-meghteal dark:text-sky-300">{log.action}</td>
                  <td className="px-2 text-xs text-slate-500 dark:text-slate-400">
                    {log.target_type} {log.target_id.slice(0, 8)}…
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No audit entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("meghnetra_admin_token"));

  if (!loggedIn) return <LoginForm onLogin={() => setLoggedIn(true)} />;
  return <AdminQueue />;
}
