import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="max-w-sm mx-auto mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h1 className="text-lg font-bold text-meghblue mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button className="w-full bg-meghblue text-white text-sm px-3 py-2 rounded hover:bg-meghteal">
          Log in
        </button>
        <p className="text-xs text-gray-400">Demo credentials: admin@meghnetra.in / admin123</p>
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
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-meghblue">MEGHNETRA Admin Panel</h1>
          <p className="text-sm text-gray-500">Human-in-the-loop verification & audit</p>
        </div>
        <div className="flex gap-3 items-center">
          <Link to="/" className="text-sm text-meghteal underline">
            ← Public Dashboard
          </Link>
          <button onClick={logout} className="text-sm text-red-600 underline">
            Log out
          </button>
        </div>
      </header>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("queue")}
          className={`px-3 py-1.5 text-sm rounded ${tab === "queue" ? "bg-meghblue text-white" : "bg-white border"}`}
        >
          Review Queue ({queue.length})
        </button>
        <button
          onClick={() => setTab("audit")}
          className={`px-3 py-1.5 text-sm rounded ${tab === "audit" ? "bg-meghblue text-white" : "bg-white border"}`}
        >
          Audit Log
        </button>
      </div>

      {tab === "queue" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ReportQueueTable queue={queue} />
        </div>
      )}

      {tab === "audit" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-2">Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="py-2 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="text-xs">{log.actor}</td>
                  <td className="text-xs font-medium">{log.action}</td>
                  <td className="text-xs">
                    {log.target_type} {log.target_id.slice(0, 8)}…
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400 text-xs">
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
