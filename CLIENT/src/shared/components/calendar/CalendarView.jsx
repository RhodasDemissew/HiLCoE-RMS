import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { api } from "../../../api/client.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Africa/Addis_Ababa";
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1, locale: enUS }),
  getDay,
  locales,
});
const COLORS = {
  synopsis: "#2563eb",
  defense: "#7c3aed",
  other: "#6b7280",
};

function eventColor(type) {
  if (!type) return COLORS.other;
  if (type === "synopsis") return COLORS.synopsis;
  if (type === "defense") return COLORS.defense;
  return COLORS.other;
}

function buildIcs(event) {
  const dtStart = dayjs(event.start).utc().format("YYYYMMDDTHHmmss[Z]");
  const dtEnd = dayjs(event.end || event.start).utc().format("YYYYMMDDTHHmmss[Z]");
  const uid = event.id || `${dtStart}-${Math.random().toString(36).slice(2)}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HiLCoE RMS//Schedule//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dayjs().utc().format("YYYYMMDDTHHmmss[Z]")}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title || "Event"}`,
    event.venue ? `LOCATION:${event.venue}` : "",
    event.link ? `URL:${event.link}` : "",
    event.notes ? `DESCRIPTION:${event.notes}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

function downloadIcs(event) {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title || "event"}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function CalendarView({ role }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setselectedEvent] = useState(null);

  const filters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      from: params.from || dayjs().tz(TZ).startOf("month").format("YYYY-MM-DD"),
      to: params.to || dayjs().tz(TZ).endOf("month").format("YYYY-MM-DD"),
      role: params.role || "",
      venue: params.venue || "",
      people: params.people ? params.people.split(",").filter(Boolean) : [],
      types: params.types ? params.types.split(",").filter(Boolean) : ["synopsis", "defense"],
      showCancelled: params.showCancelled === "true",
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (patch) => {
      const next = {
        ...Object.fromEntries(searchParams.entries()),
        ...patch,
      };
      if (Array.isArray(next.people)) next.people = next.people.join(",");
      if (Array.isArray(next.types)) next.types = next.types.join(",");
      Object.keys(next).forEach((key) => {
        if (next[key] === undefined || next[key] === "" || next[key] === null) delete next[key];
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        if (filters.role) params.set("role", filters.role);
        if (filters.venue) params.set("venue", filters.venue);
        if (filters.people?.length) params.set("people", filters.people.join(","));
        if (filters.types?.length) params.set("types", filters.types.join(","));
        if (filters.showCancelled) params.set("includeCancelled", "true");
        if (role === "supervisor" || role === "researcher") params.set("mine", "true");
        const res = await api(`/calendar?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load events");
        const items = Array.isArray(data?.items) ? data.items : [];
        const normalized = items.map((item) => ({
          id: item.id,
          title: item.title,
          start: item.startAt,
          end: item.endAt || item.startAt,
          typeKey: item.type || "other",
          venue: item.venue || "",
          link: item.link || "",
          notes: item.notes || "",
          status: item.status,
          people: Array.isArray(item.people) ? item.people : [],
          durationMins: item.durationMins,
        }));
        setEventData(normalized);
      } catch (err) {
        setError(err.message || "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters.from, filters.to, filters.role, filters.people, filters.venue, filters.types, filters.showCancelled, role, updateFilters]); // updateFilters to suppress lint

  const peopleOptions = useMemo(() => {
    const map = new Map();
    eventData.forEach((event) => {
      const list = event.people || [];
      list.forEach((person) => {
        if (!person?.id) return;
        if (!map.has(person.id)) map.set(person.id, person);
      });
    });
    return Array.from(map.values());
  }, [eventData]);

  const venues = useMemo(() => {
    const out = new Set();
    eventData.forEach((event) => {
      const venue = event.venue;
      if (venue) out.add(venue);
    });
    return Array.from(out);
  }, [eventData]);

  

  const handleRangeChange = useCallback(
    (range) => {
      let start;
      let end;
      if (Array.isArray(range)) {
        start = range[0];
        end = range[range.length - 1];
      } else if (range && range.start && range.end) {
        start = range.start;
        end = range.end;
      } else {
        start = range;
        end = range;
      }
      if (!start || !end) return;
      updateFilters({
        from: dayjs(start).format("YYYY-MM-DD"),
        to: dayjs(end).format("YYYY-MM-DD"),
      });
    },
    [updateFilters]
  );

  const calendarEvents = useMemo(() =>
    eventData.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      typeKey: event.typeKey,
      data: event,
    })),
  [eventData]);

  const types = useMemo(
    () => [
      { key: "synopsis", label: "Synopsis" },
      { key: "defense", label: "Defense" },
      { key: "other", label: "Other" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[color:var(--neutral-600)]">
            Date from
            <input
              type="date"
              value={filters.from}
              onChange={(event) => updateFilters({ from: event.target.value })}
              className="h-10 rounded-xl border border-[color:var(--neutral-200)] px-3 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[color:var(--neutral-600)]">
            Date to
            <input
              type="date"
              value={filters.to}
              onChange={(event) => updateFilters({ to: event.target.value })}
              className="h-10 rounded-xl border border-[color:var(--neutral-200)] px-3 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[color:var(--neutral-600)]">
            Venue
            <select
              value={filters.venue}
              onChange={(event) => updateFilters({ venue: event.target.value || undefined })}
              className="h-10 rounded-xl border border-[color:var(--neutral-200)] bg-white px-3 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none"
            >
              <option value="">All venues</option>
              {venues.map((venue) => (
                <option key={venue} value={venue}>
                  {venue}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[color:var(--neutral-600)]">
            People
            <select
              multiple
              value={filters.people}
              onChange={(event) => {
                const values = Array.from(event.target.selectedOptions, (opt) => opt.value);
                updateFilters({ people: values });
              }}
              className="h-20 rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none"
            >
              {peopleOptions.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.role ? `${person.role}: ` : ""}
                  {person.name || person.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {types.map((type) => {
            const checked = filters.types.includes(type.key);
            return (
              <label key={type.key} className="flex items-center gap-2 text-xs font-semibold text-[color:var(--neutral-600)]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const set = new Set(filters.types);
                    if (event.target.checked) set.add(type.key);
                    else set.delete(type.key);
                    const next = Array.from(set);
                    updateFilters({ types: next.length ? next : undefined });
                  }}
                />
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: eventColor(type.key) }} />
                  {type.label}
                </span>
              </label>
            );
          })}
          <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-[color:var(--neutral-600)]">
            <input
              type="checkbox"
              checked={filters.showCancelled}
              onChange={(event) => updateFilters({ showCancelled: event.target.checked ? "true" : undefined })}
            />
            Show cancelled
          </label>
          <button
            type="button"
            className="text-xs font-semibold text-[color:var(--brand-600)] hover:underline"
            onClick={() =>
              updateFilters({
                from: dayjs().tz(TZ).startOf("month").format("YYYY-MM-DD"),
                to: dayjs().tz(TZ).endOf("month").format("YYYY-MM-DD"),
                types: ["synopsis", "defense"],
                people: undefined,
                venue: undefined,
                role: undefined,
                showCancelled: undefined,
              })
            }
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-2 shadow-soft">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "70vh" }}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          step={30}
          popup
          onSelectEvent={(event) => setselectedEvent(event.data)}
          onRangeChange={handleRangeChange}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: eventColor(event.typeKey),
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              padding: "4px 8px",
            },
          })}
        />
        {loading && (
          <div className="mt-4 text-center text-sm text-[color:var(--neutral-500)]">Loading events...</div>
        )}
      </div>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}


      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
                  {selectedEvent.typeKey || "event"}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[color:var(--neutral-900)]">
                  {selectedEvent.title}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--neutral-600)]">
                  {formatRange(selectedEvent.start, selectedEvent.end ? dayjs(selectedEvent.end).diff(selectedEvent.start, "minute") : selectedEvent.durationMins)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 text-xs font-semibold text-[color:var(--neutral-500)] hover:bg-[color:var(--neutral-200)]"
                onClick={() => setselectedEvent(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              {selectedEvent.venue && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">Venue</p>
                  <p className="text-[color:var(--neutral-800)]">{selectedEvent.venue}</p>
                </div>
              )}
              {selectedEvent.link && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">Meeting Link</p>
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[color:var(--brand-600)] hover:underline break-all"
                  >
                    {selectedEvent.link}
                  </a>
                </div>
              )}
              {selectedEvent.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">Notes</p>
                  <p className="text-[color:var(--neutral-700)] whitespace-pre-wrap">{selectedEvent.notes}</p>
                </div>
              )}
              {!!(selectedEvent.people || []).length && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">Participants</p>
                  <ul className="mt-1 space-y-1 text-[color:var(--neutral-700)]">
                    {selectedEvent.people.map((person) => (
                      <li key={person.id} className="flex items-center gap-2">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--brand-500)]" aria-hidden></span>
                        <span>
                          {person.name || person.id}
                          {person.role ? ` • ${person.role}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-xl bg-[color:var(--brand-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--brand-500)]"
                onClick={() => downloadIcs(selectedEvent)}
              >
                Download .ics
              </button>
              <button
                type="button"
                className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)]"
                onClick={() => setselectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

CalendarView.propTypes = {
  role: PropTypes.oneOf(["coordinator", "supervisor", "researcher"]),
};










