import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import CalendarView from "../../../shared/components/calendar/CalendarView.jsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Africa/Addis_Ababa";

function findConflicts(events) {
  const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  const conflicts = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const currentEnd = new Date(sorted[i].end).getTime();
    const nextStart = new Date(sorted[i + 1].start).getTime();
    if (nextStart < currentEnd) {
      conflicts.push({ a: sorted[i], b: sorted[i + 1] });
    }
  }
  return conflicts;
}

function UpcomingList({ events = [] }) {
  if (!events.length) {
    return (
      <div className="rounded-2xl border border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-6 text-sm text-[color:var(--neutral-500)]">
        No upcoming defenses scheduled.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-4 py-6 text-sm text-[color:var(--neutral-700)]">
      <h3 className="text-sm font-semibold text-[color:var(--neutral-800)]">Next sessions</h3>
      <ul className="mt-2 space-y-2">
        {events.map((event) => (
          <li key={event.id}>
            <span className="font-semibold text-[color:var(--neutral-900)]">{event.title}</span>
            <span className="block text-xs text-[color:var(--neutral-500)]">
              {dayjs(event.start).isValid() ? dayjs(event.start).tz(TZ).format("MMM D, YYYY HH:mm [UTC+3]") : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

UpcomingList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object),
};

export default function SupervisorScheduleWorkspace({ user }) {
  const userId = user?._id || user?.id || user?.userId || null;
  const [events, setEvents] = useState([]);

  const conflicts = useMemo(() => findConflicts(events), [events]);
  const upcoming = useMemo(
    () => events.filter((event) => new Date(event.start) >= new Date()).slice(0, 5),
    [events]
  );

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Schedule</h1>
        <p className="text-sm text-[color:var(--neutral-600)]">
          Review defenses you are assigned to and respond when required.
        </p>
      </header>

      {conflicts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You have overlapping defenses. Please review your calendar.
        </div>
      )}

      <CalendarView role="supervisor" currentUserId={userId} onEventsLoaded={setEvents} />

      <UpcomingList events={upcoming} />
    </section>
  );
}

SupervisorScheduleWorkspace.propTypes = {
  user: PropTypes.object,
};
