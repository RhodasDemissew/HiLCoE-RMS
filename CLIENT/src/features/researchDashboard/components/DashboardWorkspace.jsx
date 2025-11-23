import PropTypes from "prop-types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import messageIcon from "../../../assets/icons/message.png";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Africa/Addis_Ababa";

function SummaryCard({ title, value, loading }) {
  const displayValue =
    typeof value === "number"
      ? value.toLocaleString()
      : value ?? "0";
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--neutral-500)]">{title}</p>
      {loading ? (
        <div className="mt-4 h-7 w-16 animate-pulse rounded bg-[color:var(--neutral-200)]" aria-hidden></div>
      ) : (
        <p className="mt-4 text-3xl font-semibold text-[color:var(--neutral-900)]">{displayValue}</p>
      )}
    </article>
  );
}

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.bool,
};

function QuickActionsCard({ items = [] }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Quick actions</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">Shortcuts to keep things moving</p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex items-start gap-3 rounded-2xl border border-[color:var(--neutral-200)] px-4 py-4 text-left transition hover:bg-[color:var(--neutral-50)]"
            onClick={item.onClick}
          >
            <img src={item.icon} alt="" className="h-10 w-10" loading="lazy" decoding="async" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-[color:var(--neutral-900)]">{item.label}</p>
              <p className="text-xs text-[color:var(--neutral-600)]">{item.sublabel}</p>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

QuickActionsCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.string.isRequired,
      sublabel: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
};

function MilestonesCard({ items = [], loading }) {
  const statusTone = (status) => {
    if (!status) return "bg-[color:var(--neutral-200)] text-[color:var(--neutral-600)]";
    const norm = status.toLowerCase();
    if (norm.includes("complete")) return "bg-emerald-100 text-emerald-700";
    if (norm.includes("resubmit")) return "bg-amber-100 text-amber-700";
    if (norm.includes("progress")) return "bg-[color:var(--brand-600)]/10 text-[color:var(--brand-600)]";
    return "bg-[color:var(--neutral-200)] text-[color:var(--neutral-600)]";
  };

  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Milestones</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">Track your stage progression</p>
      </header>
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={`milestone-skeleton-${idx}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 animate-pulse rounded bg-[color:var(--neutral-200)]" aria-hidden></div>
                  <div className="h-5 w-20 animate-pulse rounded bg-[color:var(--neutral-200)]" aria-hidden></div>
                </div>
                <div className="h-2 w-full animate-pulse rounded bg-[color:var(--neutral-200)]" aria-hidden></div>
              </div>
            ))
          : items.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-[color:var(--neutral-800)]">
                  <span>{item.label}</span>
                  <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${statusTone(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--neutral-200)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--brand-600)] transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, item.percent ?? 0))}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            ))}
      </div>
    </article>
  );
}

MilestonesCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      percent: PropTypes.number,
      status: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
};

function UpcomingEventsCard({ events = [], loading }) {
  const hasEvents = events.length > 0;
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Upcoming schedule</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">Your synopsis and defense commitments</p>
      </header>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`event-skeleton-${idx}`} className="space-y-2 rounded-2xl border border-[color:var(--neutral-200)] px-4 py-3">
              <div className="h-4 w-40 animate-pulse rounded bg-[color:var(--neutral-200)]" aria-hidden></div>
              <div className="h-3 w-24 animate-pulse rounded bg-[color:var(--neutral-200)]" aria-hidden></div>
            </div>
          ))}
        </div>
      ) : hasEvents ? (
        <ul className="space-y-3">
          {events.map((event) => {
            const start = event.startAt ? dayjs(event.startAt).tz(TZ) : null;
            const formattedDate = start?.isValid() ? start.format("MMM D, YYYY") : "TBD";
            const formattedTime = start?.isValid() ? start.format("HH:mm") : "";
            const badgeTone =
              event.type === "defense"
                ? "bg-purple-100 text-purple-700"
                : event.type === "synopsis"
                ? "bg-blue-100 text-blue-700"
                : "bg-[color:var(--neutral-200)] text-[color:var(--neutral-600)]";
            return (
              <li key={event.id || `${event.title}-${formattedDate}`} className="rounded-2xl border border-[color:var(--neutral-200)] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--neutral-900)]">{event.title}</p>
                  <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${badgeTone}`}>
                    {event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : "Event"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--neutral-600)]">
                  {formattedDate}
                  {formattedTime ? ` - ${formattedTime} (UTC+3)` : ""}
                </p>
                {event.venue ? (
                  <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Venue: {event.venue}</p>
                ) : null}
                {event.link ? (
                  <a href={event.link} className="mt-1 inline-block text-xs font-semibold text-[color:var(--brand-600)] hover:underline">
                    Join meeting
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-6 text-center text-sm text-[color:var(--neutral-600)]">
          Nothing scheduled yet. We'll keep this updated as events are confirmed.
        </div>
      )}
    </article>
  );
}

UpcomingEventsCard.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      type: PropTypes.string,
      startAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      venue: PropTypes.string,
      link: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
};

function MessagesPanel({ messages = [], loading = false, onViewAll }) {
  const hasMessages = Array.isArray(messages) && messages.length > 0;
  const handleViewAll = () => {
    if (typeof onViewAll === "function") {
      onViewAll();
    }
  };
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Messages</h2>
          <p className="text-xs text-[color:var(--neutral-500)]">Latest conversations with your supervisors</p>
        </div>
        <button 
          type="button" 
          className="text-xs font-semibold text-[color:var(--brand-600)] hover:text-[color:var(--brand-700)] hover:underline"
          onClick={handleViewAll}
        >
          View inbox
        </button>
      </header>
      {loading ? (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500">Loading messages...</div>
        </div>
      ) : hasMessages ? (
        <ul className="space-y-3">
          {messages.slice(0, 4).map((message) => (
            <li key={message.id} className="rounded-xl border border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--neutral-900)]">{message.author}</p>
                  <p className="text-xs text-[color:var(--neutral-500)]">{message.role}</p>
                </div>
                <span className="text-xs text-[color:var(--neutral-400)]">{message.ago}</span>
              </div>
              <p className="mt-2 text-xs text-[color:var(--neutral-600)]">{message.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-6 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-600)]/15">
            <img src={messageIcon} alt="" className="h-6 w-6" loading="lazy" decoding="async" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-medium text-[color:var(--neutral-700)]">No messages yet</p>
          <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Start a conversation with your supervisor or coordinator.</p>
        </div>
      )}
    </article>
  );
}

MessagesPanel.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      author: PropTypes.string,
      role: PropTypes.string,
      ago: PropTypes.string,
      body: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  onViewAll: PropTypes.func,
};

function ProgressChart({ labels = [], series = [] }) {
  const chartData = labels.map((label, index) => {
    const row = { name: label };
    series.forEach((set) => {
      row[set.name] = set.data?.[index] ?? 0;
    });
    return row;
  });

  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Research progress overview</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">Submission and approval trends over time</p>
      </header>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="researchColorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-600)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--brand-600)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="researchColorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
            <XAxis dataKey="name" stroke="rgba(15,23,42,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(15,23,42,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            {series.map((set, idx) => (
              <Area
                key={set.name}
                type="monotone"
                dataKey={set.name}
                stroke={idx === 0 ? "var(--brand-600)" : "var(--accent-500)"}
                fill={idx === 0 ? "url(#researchColorA)" : "url(#researchColorB)"}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

ProgressChart.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string),
  series: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.number),
    })
  ),
};

export default function DashboardWorkspace({
  user,
  isLoading,
  kpiCards = [],
  quickActions = [],
  milestones = [],
  chartLabels = [],
  chartSeries = [],
  messages = [],
  events = [],
  welcomeTitle,
  welcomeMessage,
  loadingTitle = "Loading profile?",
  fallbackName = "Member",
  dashboardLoading = false,
  dashboardError = "",
  messagesLoading = false,
  onNavigateToMessages,
}) {
  const resolvedName = (user?.name || "").trim() || fallbackName;
  const headerTitle = welcomeTitle ?? `Welcome, ${resolvedName}`;
  const headerMessage = welcomeMessage ?? "";
  const displayTitle = isLoading ? loadingTitle : headerTitle;
  const displayMessage = isLoading ? "" : headerMessage;
  const quickActionItems = (quickActions || []).map((action) => ({
    icon: action.icon,
    label: action.label,
    sublabel: action.sublabel,
    onClick: action.onClick || (() => {}),
  }));

  return (
    <section className="rounded-3xl bg-white px-8 py-8 shadow-sm">
      <header className="border-b border-[color:var(--neutral-200)] pb-6">
        <h1 className="text-3xl font-semibold text-[color:var(--neutral-900)]">{displayTitle}</h1>
        {displayMessage ? <p className="mt-2 text-sm text-[color:var(--neutral-600)]">{displayMessage}</p> : null}
      </header>

      {dashboardError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {dashboardError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <SummaryCard key={card.title} title={card.title} value={card.value ?? 0} loading={dashboardLoading} />
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <QuickActionsCard items={quickActionItems} />
          <ProgressChart labels={chartLabels} series={chartSeries} />
        </div>
        <div className="space-y-5">
          <MessagesPanel messages={messages} loading={messagesLoading} onViewAll={onNavigateToMessages} />
          <UpcomingEventsCard events={events} loading={dashboardLoading} />
          <MilestonesCard items={milestones} loading={dashboardLoading} />
        </div>
      </div>
    </section>
  );
}

DashboardWorkspace.propTypes = {
  user: PropTypes.object,
  isLoading: PropTypes.bool,
  kpiCards: PropTypes.array,
  quickActions: PropTypes.array,
  milestones: PropTypes.array,
  chartLabels: PropTypes.array,
  chartSeries: PropTypes.array,
  messages: PropTypes.array,
  events: PropTypes.array,
  welcomeTitle: PropTypes.string,
  welcomeMessage: PropTypes.string,
  loadingTitle: PropTypes.string,
  fallbackName: PropTypes.string,
  dashboardLoading: PropTypes.bool,
  dashboardError: PropTypes.string,
  messagesLoading: PropTypes.bool,
  onNavigateToMessages: PropTypes.func,
};
