import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import client from "../../api/client";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-meghblue mb-2">Event Trend (last 7 days)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {categories.map((cat) => (
            <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[cat]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
