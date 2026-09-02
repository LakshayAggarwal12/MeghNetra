import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import client from "../../api/client";
import { useSettings } from "../../context/SettingsContext";

const COLORS: Record<string, string> = {
  rainfall: "#38bdf8",     // sky-400
  flooding: "#2563eb",     // blue-600
  thunderstorm: "#8b5cf6", // violet-500
  heatwave: "#f97316",     // orange-500
  fog: "#94a3b8",          // slate-400
  dust_storm: "#eab308",   // yellow-500
  strong_wind: "#14b8a6",  // teal-500
  cyclone: "#d946ef",      // fuchsia-500
  other: "#475569",        // slate-600
};

export default function TrendChart() {
  const [data, setData] = useState<any[]>([]);
  const { theme } = useSettings();
  
  // Softer, transparent axis and grid colors for the premium feel
  const axisColor = theme === "dark" ? "#64748b" : "#94a3b8";
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

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
    <div className="relative w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-white/5 transition-all hover:shadow-md">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20">
            <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Event Trend</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Trailing 7 Days Volume</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Live Data</span>
        </div>
      </div>

      <div className="relative z-10 w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: axisColor, fontWeight: 500 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fontSize: 11, fill: axisColor, fontWeight: 500 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
              contentStyle={{
                backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 500,
                color: theme === "dark" ? "#f1f5f9" : "#0f172a",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)"
              }}
              itemStyle={{ fontWeight: 600, padding: "2px 0" }}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: "15px" }} 
              iconType="circle" 
              iconSize={8} 
            />
            {categories.map((cat, index) => (
              <Bar 
                key={cat} 
                dataKey={cat} 
                stackId="a" 
                fill={COLORS[cat]} 
                radius={
                  index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}