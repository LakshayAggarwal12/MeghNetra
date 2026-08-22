import React from "react";
import { Link } from "react-router-dom";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

export default function ReportQueueTable({ queue }: { queue: WeatherEvent[] }) {
  if (queue.length === 0) {
    return <div className="text-sm text-gray-500 p-4">Queue is empty — nothing awaiting review.</div>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b">
          <th className="py-2">Category</th>
          <th>Location</th>
          <th>Severity</th>
          <th>Status</th>
          <th>Confidence</th>
          <th>Reports</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {queue.map((event) => (
          <tr key={event.id} className="border-b last:border-0 hover:bg-gray-50">
            <td className="py-2">
              <CategoryBadge category={event.category} />
            </td>
            <td>
              {event.city}, {event.state}
            </td>
            <td>
              <SeverityChip severity={event.severity} />
            </td>
            <td>
              <StatusBadge status={event.status} />
            </td>
            <td>{Number(event.confidence_score).toFixed(0)}%</td>
            <td>{event.report_count}</td>
            <td>
              <Link to={`/events/${event.id}`} className="text-meghteal underline text-xs">
                Review →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
