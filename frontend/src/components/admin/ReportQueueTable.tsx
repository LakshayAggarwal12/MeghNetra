import React from "react";
import { Link } from "react-router-dom";
import { Inbox, ArrowRight } from "lucide-react";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

export default function ReportQueueTable({ queue }: { queue: WeatherEvent[] }) {
  if (queue.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Queue is empty — nothing awaiting review.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wide">
            <th className="py-3 px-2">Category</th>
            <th className="px-2">Location</th>
            <th className="px-2">Severity</th>
            <th className="px-2">Status</th>
            <th className="px-2">Confidence</th>
            <th className="px-2">Reports</th>
            <th className="px-2"></th>
          </tr>
        </thead>
        <tbody>
          {queue.map((event) => (
            <tr
              key={event.id}
              className="border-b last:border-0 border-slate-100 dark:border-slate-800
                         hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-surface"
            >
              <td className="py-3 px-2"><CategoryBadge category={event.category} /></td>
              <td className="px-2 text-slate-700 dark:text-slate-300">{event.city}, {event.state}</td>
              <td className="px-2"><SeverityChip severity={event.severity} /></td>
              <td className="px-2"><StatusBadge status={event.status} /></td>
              <td className="px-2 font-semibold text-meghteal dark:text-sky-300 tabular-nums">
                {Number(event.confidence_score).toFixed(0)}%
              </td>
              <td className="px-2 text-slate-500 dark:text-slate-400">{event.report_count}</td>
              <td className="px-2">
                <Link to={`/events/${event.id}`} className="flex items-center gap-1 text-meghteal hover:text-meghblue dark:hover:text-sky-300 text-xs font-medium">
                  Review <ArrowRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
