import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import client from "../../api/client";
import { useSettings } from "../../context/SettingsContext";

const COLORS: Record<string, string> = {
  rainfall: "#3b82f6",
  flooding: "#0ea5e9",
  thunderstorm: "#6366f1",
  heatwave: "#ef4444",
  fog: "#94a3b8",
  dust_storm: "#ca8a04",
  strong_wind: "#14b8a6",
  cyclone: "#a855f7",
  other: "#64748b",
};

export default function TrendChart() {
  const [data, setData] = useState<any[]>([]);
  const { theme } = useSettings();
  const axisColor = theme === "dark" ? "#8891c2" : "#5b6597";
  const gridColor = theme === "dark" ? "#323a5e" : "#dde3f4";

  useEffect(() => {
    client
      .get("/analytics/trends", { params: { hours: 168 } })
      .then(({ data }) => {
        const formatted = data.trends.map((row: any) => ({
          ...row,
          time: new Date(row.time).toLocaleDateString([], { month: "short", day: "numeric" }),
        }));
        setData(formatted);
      })
      .catch(() => {});
  }, []);

  const categories = Object.keys(COLORS);

  return (
    <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-4 transition-surface">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-meghteal" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Event Trend (last 7 days)</h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: axisColor }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} />
          <Tooltip
            contentStyle={{
              background: theme === "dark" ? "#232a4a" : "#ffffff",
              border: "1px solid " + gridColor,
              borderRadius: 8,
              fontSize: 12,
              color: theme === "dark" ? "#eaedf9" : "#141829",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {categories.map((cat) => (
            <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[cat]} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
