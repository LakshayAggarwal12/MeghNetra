import React from "react";
import { Link } from "react-router-dom";
import { Inbox, ArrowRight, ShieldAlert } from "lucide-react";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

export default function ReportQueueTable({ queue }: { queue: WeatherEvent[] }) {
  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5">
        <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3 shadow-inner">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Queue is clear</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">No pending reports awaiting moderation at this moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-[11px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-white/5 uppercase tracking-wider">
              <th className="py-4 px-6">Category</th>
              <th className="px-6">Location</th>
              <th className="px-6">Severity</th>
              <th className="px-6">Status</th>
              <th className="px-6">Confidence</th>
              <th className="px-6">Reports</th>
              <th className="px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {queue.map((event) => (
              <tr
                key={event.id}
                className="group hover:bg-cyan-500/[0.03] dark:hover:bg-cyan-500/[0.04] transition-colors"
              >
                <td className="py-4 px-6">
                  <CategoryBadge category={event.category} />
                </td>
                <td className="px-6 text-slate-700 dark:text-slate-200 font-semibold text-xs">
                  {event.city}, <span className="text-slate-400 dark:text-slate-400 font-medium">{event.state}</span>
                </td>
                <td className="px-6">
                  <SeverityChip severity={event.severity} />
                </td>
                <td className="px-6">
                  <StatusBadge status={event.status} />
                </td>
                <td className="px-6 font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {Number(event.confidence_score).toFixed(0)}%
                </td>
                <td className="px-6 font-medium text-xs text-slate-600 dark:text-slate-400">
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5">
                    {event.report_count}
                  </span>
                </td>
                <td className="px-6 text-right">
                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider
                               bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white 
                               dark:bg-cyan-950/50 dark:text-cyan-300 dark:hover:bg-cyan-600 dark:hover:text-white
                               border border-cyan-200/60 dark:border-cyan-800/50 shadow-sm transition-all group-hover:scale-105"
                  >
                    Review <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}