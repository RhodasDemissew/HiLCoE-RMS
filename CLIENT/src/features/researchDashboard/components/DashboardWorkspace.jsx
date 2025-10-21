import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
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

function StatCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white p-6 shadow-soft">
      <p className="text-sm font-medium text-[color:var(--neutral-600)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--neutral-900)]">{value}</p>
    </article>
  );
}

function QuickActionsGrid({ items, cardClassName = '' }) {
  return (
    <article className={`rounded-2xl border border-[color:var(--neutral-200)] bg-white p-6 shadow-soft ${cardClassName}`}>
      <header aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="h3 text-[color:var(--neutral-900)]">Quick Actions</h2>
        <p className="body mt-1 text-[color:var(--neutral-600)]">Frequently used actions and shortcuts</p>
      </header>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="flex items-center gap-3 rounded-[18px] border border-[color:var(--neutral-200)] px-4 py-4 text-left transition hover:bg-[color:var(--neutral-100)]"
          >
            <img src={item.icon} alt="" className="h-10 w-10" loading="lazy" decoding="async" />
            <div>
              <div className="text-sm font-semibold text-[color:var(--neutral-900)]">{item.label}</div>
              <div className="text-xs text-[color:var(--neutral-600)]">{item.sublabel}</div>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

function MilestonesProgress({ items, cardClassName = '' }) {
  const statusStyles = {
    Pending: "bg-[color:var(--neutral-200)] text-[color:var(--neutral-700)]",
    "In Progress": "bg-[color:var(--brand-600)]/15 text-[color:var(--brand-600)]",
    Completed: "bg-[color:var(--accent-emerald)]/15 text-[color:var(--accent-emerald)]",
  };

  return (
    <article className={`rounded-2xl border border-[color:var(--neutral-200)] bg-white p-6 shadow-soft ${cardClassName}`}>
      <h2 id="research-progress-title" className="h3 text-[color:var(--neutral-900)]">Research Progress</h2>
      <p className="body mt-1 text-[color:var(--neutral-600)]">Latest milestone updates</p>
      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-[color:var(--neutral-700)]">
              <span>{item.label}</span>
              <span className={`${statusStyles[item.status]} rounded-full px-3 py-1 text-xs font-semibold`}>
                {item.status}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[color:var(--neutral-200)]">
              <div
                className="h-full rounded-full bg-[color:var(--brand-600)] transition-all"
                style={{ width: `${item.percent}%` }}
                aria-hidden
              />
            </div>
            <span className="text-xs text-[color:var(--neutral-500)]">{item.percent}% complete</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function MessagesPanel({ items, className = '' }) {
  const hasMessages = items.length > 0;

  return (
    <aside className={`rounded-2xl border border-[color:var(--neutral-200)] bg-white p-6 shadow-soft h-full flex flex-col ${className}`} aria-labelledby="messages-title">
      <h2 id="messages-title" className="h3 text-[color:var(--neutral-900)]">Messages</h2>
      <div className="mt-4 flex-1 overflow-auto">
        {hasMessages ? (
          <ul className="space-y-4">
            {items.map((msg) => (
              <li key={msg.id}>{msg.subject}</li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[color:var(--neutral-200)] bg-white/50 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10">
              <img src={messageIcon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium text-[color:var(--neutral-700)]">No messages yet.</p>
            <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Start a conversation with your supervisor.</p>
          </div>
        )}
      </div>
      <button
        type="button"
        className="btn mt-4 w-full rounded-[14px] py-3 text-sm font-semibold"
        onClick={() => console.log("View all messages")}
      >
        View All Messages
      </button>
    </aside>
  );
}

function EventsTimeline({ items, cardClassName = '' }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const hasEvents = items.length > 0;

  function handleDateChange(value) {
    setSelectedDate(value);
    console.log("Calendar date selected", value);
  }

  return (
  <article className={`rounded-2xl border border-[color:var(--neutral-200)] bg-white p-6 shadow-soft ${cardClassName}`} aria-labelledby="events-title">
      <h2 id="events-title" className="h3 text-[color:var(--neutral-900)]">Events & Deadlines</h2>
      {hasEvents ? (
        <ul className="mt-4 space-y-4">
          {items.map((event) => (
            <li key={event.title}>{event.title}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-[18px] border border-dashed border-[color:var(--neutral-200)] bg-white/50 py-6 text-center text-sm text-[color:var(--neutral-600)]">
          Nothing scheduled yet. Stay tuned for upcoming milestones.
        </div>
      )}
      <div className="mt-6 overflow-hidden rounded-[18px] border border-[color:var(--neutral-200)] bg-white">
        <Calendar
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full text-[color:var(--neutral-800)] [&_.react-calendar__navigation]:bg-[color:var(--neutral-100)] [&_.react-calendar__navigation button]:text-sm [&_.react-calendar__tile]:text-sm"
        />
      </div>
      <button
        type="button"
        className="btn-ghost mt-6 w-full rounded-[14px] py-3 text-sm font-semibold"
        onClick={() => console.log("View full calendar")}
      >
        View Full Calendar
      </button>
    </article>
  );
}

function ProgressChart({ labels, series, cardClassName = '' }) {
  const chartData = labels.map((label, index) => {
    const entry = { name: label };
    series.forEach((s) => {
      entry[s.name] = s.data[index] ?? 0;
    });
    return entry;
  });

  return (
    <article className={`rounded-2xl border border-[color:var(--neutral-200)] bg-white p-6 shadow-soft min-h-[420px] h-full ${cardClassName}`} aria-labelledby="progress-overview-title">
      <h2 id="progress-overview-title" className="h3 text-[color:var(--neutral-900)]">Research Progress Overview</h2>
      <p className="body mt-1 text-[color:var(--neutral-600)]">Track your submission and approval rates over time.</p>
      <div className="mt-6 h-[280px]">
        <ResponsiveContainer width="100%" height="150%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-600)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--brand-600)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
            <XAxis dataKey="name" stroke="rgba(15,23,42,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(15,23,42,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Area type="monotone" dataKey="Submissions" stroke="var(--brand-600)" fill="url(#colorA)" />
            <Area type="monotone" dataKey="Approvals" stroke="var(--accent-500)" fill="url(#colorB)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

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
  loadingTitle = 'Loading profile?',
  fallbackName = 'Member',
}) {
  const safeFallbackName = fallbackName || 'Member';
  const resolvedName = (user?.name || '').trim() || safeFallbackName;
  const headerTitle = welcomeTitle ?? `Welcome, ${resolvedName}`;
  const headerMessage = welcomeMessage ?? '';
  const displayTitle = isLoading ? loadingTitle : headerTitle;
  const displayMessage = isLoading ? '' : headerMessage;

  const quickActionItems = quickActions.map((action) => ({
    icon: action.icon,
    label: action.label,
    sublabel: action.sublabel,
    onClick: () => console.log(action.label),
  }));

  return (
    <div className="absolute left-70 w-400 z-10">
      <header className="mb-8 rounded-2xl border border-transparent  px-8 py-6 shadow-soft">
        <h1 className="h2 text-[color:var(--neutral-900)]">{displayTitle}</h1>
        {displayMessage ? (
          <p className="body mt-2 text-[color:var(--neutral-600)]">{displayMessage}</p>
        ) : null}
      </header>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 mb-6">
        {kpiCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main content: 5-column grid on xl, message panel spans 2 rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 xl:gap-6 mb-6">
        {/* Left: 3 main cards stacked on xl */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
          <QuickActionsGrid items={quickActionItems} cardClassName="w-120 px-8 py-8" />
          <MilestonesProgress items={milestones} cardClassName="w-150 ml-43 px-8 py-8" />
        </div>
          
        {/* Message panel on the right, spans 2 rows */}
        <div className="xl:col-span-2 xl:row-span-2 flex flex-col">
          <MessagesPanel items={messages} className="w-122 ml-35 h-full min-h-[320px] max-h-[460px]" />
        </div>
      </div>

      {/* Full width Research Progress Overview at the bottom */}
        {/* Events on left, Research Progress Overview on right */}
        <div className="mt-6 row-span-3 grid grid-cols-1 lg:grid-cols-5 gap-4 xl:gap-6">
          <div className="col-span-1 w-120">
            <EventsTimeline items={events} cardClassName="h-full min-h-[420px]" />
          </div>
          <div className="col-span-4  ml-45">
            <ProgressChart labels={chartLabels} series={chartSeries} cardClassName="h-full min-h-[420px] " />
          </div>
        </div>
    </div>
  );
}
