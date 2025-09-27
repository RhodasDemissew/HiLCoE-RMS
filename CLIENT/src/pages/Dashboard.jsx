import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import uploadIcon from "../assets/icons/upload.png";
import calendarActionIcon from "../assets/icons/calendar.png";
import chatActionIcon from "../assets/icons/chat.png";
import downloadIcon from "../assets/icons/download.png";
import reportsIcon from "../assets/icons/reports.png";
import wordIcon from "../assets/icons/word.png";
import dashboardIcon from "../assets/icons/dashboard.png";
import submissionIcon from "../assets/icons/submission.png";
import researchIcon from "../assets/icons/research.png";
import calendarSidebarIcon from "../assets/icons/caldash.png";
import messageIcon from "../assets/icons/message.png";
import settingsIcon from "../assets/icons/settings.png";
import notificationIcon from "../assets/icons/notification.png";
import logoImage from "../assets/images/logo.png";
import SubmissionWorkspace from "../components/dashboard/SubmissionWorkspace";
import MyResearchWorkspace from "../components/dashboard/MyResearchWorkspace";

const KPI_CARDS = [
  { title: "Total Submissions", value: 0 },
  { title: "Pending Reviews", value: 0 },
  { title: "Completed Tasks", value: 0 },
  { title: "Overdue Items", value: 0 },
];

const QUICK_ACTIONS = [
  { icon: uploadIcon, label: "New Submission", sublabel: "Submit research documents" },
  { icon: calendarActionIcon, label: "Schedule Meeting", sublabel: "Book supervisor meeting" },
  { icon: wordIcon, label: "View Templates", sublabel: "Browse document templates" },
  { icon: chatActionIcon, label: "Contact Support", sublabel: "Get help and guidance" },
  { icon: reportsIcon, label: "Progress Report", sublabel: "Generate progress insight" },
  { icon: downloadIcon, label: "Export Data", sublabel: "Download your data" },
];

const MILESTONES = [
  { label: "Synopsis", percent: 0, status: "Pending" },
  { label: "Proposal", percent: 0, status: "Pending" },
  { label: "Progress 1", percent: 0, status: "Pending" },
];

const CHART_LABELS = ["Figma", "Sketch", "XD", "PS", "AI"];
const NOTIFICATIONS = [];

const CHART_SERIES = [
  { name: "Submissions", data: [0, 0, 0, 0, 0] },
  { name: "Approvals", data: [0, 0, 0, 0, 0] },
];


function AppShell({ sidebar, topbar, children }) {
  return (
    <div className="min-h-screen bg-[color:var(--neutral-100)]">
      {sidebar}
      <div className="ml-[260px] flex min-h-screen flex-col">
        {topbar}
        <main className="flex-1 overflow-y-auto">
          <div className="container-px py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ active, onSelect }) {
  const NAV_ITEMS = [
    { label: "Dashboard", icon: dashboardIcon },
    { label: "Submission", icon: submissionIcon },
    { label: "My Research", icon: researchIcon },
    { label: "Calendar", icon: calendarSidebarIcon },
    { label: "Message", icon: messageIcon },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-[260px] bg-[color:var(--brand-900)] text-white">
      <div className="flex h-full flex-col">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="HiLCoE"
              className="h-12 w-12 rounded-full"
              loading="lazy"
              decoding="async"
            />
            <div>
              <div className="font-semibold text-lg">HiLCoE</div>
              <div className="text-xs text-white/70">Research Management</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === active;
            return (
              <button
                key={item.label}
                type="button"
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-white/10 text-white border-l-4 border-[color:var(--brand-600)]"
                    : "text-white/80 hover:bg-white/10",
                ].join(" ")}
                onClick={() => {
                  console.log("Navigate to", item.label);
                  onSelect?.(item.label);
                }}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-5 w-5"
                  loading="lazy"
                  decoding="async"
                  aria-hidden
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-6 pt-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
            onClick={() => {
              console.log("Navigate to Settings");
              onSelect?.("Settings");
            }}
          >
            <img
              src={settingsIcon}
              alt=""
              className="h-5 w-5"
              loading="lazy"
              decoding="async"
              aria-hidden
            />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ showSearch = false }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hasNotifications = NOTIFICATIONS.length > 0;

  useEffect(() => {
    if (!isNotificationOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationOpen]);

  function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    console.log("Search query", formData.get("query"));
  }

  function handleNotificationToggle() {
    setIsNotificationOpen((prev) => !prev);
  }

  function handleViewNotificationCenter() {
    console.log("View notification center");
    setIsNotificationOpen(false);
  }

  return (
    <header className="border-b border-muted bg-white/70 backdrop-blur">
      <div className="container-px flex h-20 items-center justify-between gap-6">
        {showSearch ? (
          <form className="relative w-full max-w-xl" onSubmit={handleSearch}>
            <label htmlFor="global-search" className="sr-only">
              Search submissions, research...
            </label>
            <input
              id="global-search"
              name="query"
              placeholder="Search submissions, research..."
              className="w-full rounded-[14px] border border-[color:var(--neutral-200)] bg-white px-4 py-3 text-sm text-[color:var(--neutral-800)] shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[12px] bg-[color:var(--brand-600)] px-4 py-2 text-xs font-semibold text-white shadow-soft"
            >
              Search
            </button>
          </form>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-6">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--brand-600)] shadow-soft"
              onClick={handleNotificationToggle}
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
              aria-haspopup="dialog"
              aria-controls="notification-panel"
            >
              <img
                src={notificationIcon}
                alt=""
                className="h-5 w-5"
                loading="lazy"
                decoding="async"
                aria-hidden
              />
              <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--brand-600)] text-xs font-semibold text-white">
                {NOTIFICATIONS.length}
              </span>
            </button>

            {isNotificationOpen && (
              <div
                id="notification-panel"
                role="dialog"
                aria-label="Notifications"
                className="absolute right-0 z-20 mt-4 w-80 rounded-[18px] border border-[color:var(--neutral-200)] bg-white p-4 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[color:var(--neutral-900)]">Notifications</h3>
                  <span className="text-xs text-[color:var(--neutral-500)]">
                    {hasNotifications ? `${NOTIFICATIONS.length} new` : "No new alerts"}
                  </span>
                </div>

                {hasNotifications ? (
                  <ul className="mt-4 space-y-3">
                    {NOTIFICATIONS.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-[14px] border border-[color:var(--neutral-200)] bg-[color:var(--neutral-100)] px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-[color:var(--neutral-900)]">{item.title}</p>
                        <p className="mt-1 text-xs text-[color:var(--neutral-600)]">{item.description}</p>
                        <span className="mt-2 inline-block text-xs text-[color:var(--neutral-500)]">{item.time}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-[14px] border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-100)] px-4 py-6 text-center">
                    <p className="text-sm font-semibold text-[color:var(--neutral-800)]">You're all caught up</p>
                    <p className="mt-1 text-xs text-[color:var(--neutral-500)]">We'll notify you when there's an update.</p>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-ghost mt-4 w-full rounded-[12px] py-2 text-sm font-semibold"
                  onClick={handleViewNotificationCenter}
                >
                  View Notification Center
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-left shadow-soft"
            onClick={() => console.log("Open profile menu")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10 text-sm font-semibold text-[color:var(--brand-600)]">
              RA
            </span>
            <div className="text-xs text-[color:var(--neutral-600)]">
              <div className="font-semibold text-[color:var(--neutral-900)]">Ruth Abebe</div>
              Student
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

function StatCard({ title, value }) {
  return (
    <article className="card rounded-card shadow-soft border border-muted px-6 py-5">
      <p className="text-sm font-medium text-[color:var(--neutral-600)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--neutral-900)]">{value}</p>
    </article>
  );
}

function QuickActionsGrid({ items }) {
  return (
    <article className="card rounded-card border border-muted bg-white shadow-soft px-6 py-6">
      <header>
        <h2 className="h3 text-[color:var(--neutral-900)]">Quick Actions</h2>
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

function MilestonesProgress({ items }) {
  const statusStyles = {
    Pending: "bg-[color:var(--neutral-200)] text-[color:var(--neutral-700)]",
    "In Progress": "bg-[color:var(--brand-600)]/15 text-[color:var(--brand-600)]",
    Completed: "bg-[color:var(--accent-emerald)]/15 text-[color:var(--accent-emerald)]",
  };

  return (
    <article className="card rounded-card border border-muted bg-white shadow-soft px-6 py-6">
      <h2 className="h3 text-[color:var(--neutral-900)]">Research Progress</h2>
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

function MessagesPanel({ items }) {
  const hasMessages = items.length > 0;

  return (
    <aside className="card rounded-card border border-muted bg-white shadow-soft px-6 py-6">
      <h2 className="h3 text-[color:var(--neutral-900)]">Message</h2>
      {hasMessages ? (
        <ul className="mt-4 space-y-4">
          {items.map((msg) => (
            <li key={msg.id}>{msg.subject}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-[18px] border border-dashed border-[color:var(--neutral-200)] bg-white/50 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10">
            <img src={messageIcon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-medium text-[color:var(--neutral-700)]">No messages yet.</p>
          <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Start a conversation with your supervisor.</p>
        </div>
      )}
      <button
        type="button"
        className="btn mt-6 w-full rounded-[14px] py-3 text-sm font-semibold"
        onClick={() => console.log("View all messages")}
      >
        View All Messages
      </button>
    </aside>
  );
}

function EventsTimeline({ items }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const hasEvents = items.length > 0;

  function handleDateChange(value) {
    setSelectedDate(value);
    console.log("Calendar date selected", value);
  }

  return (
    <article className="card rounded-card border border-muted bg-white shadow-soft px-6 py-6">
      <h2 className="h3 text-[color:var(--neutral-900)]">Events and Deadlines</h2>
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

function ProgressChart({ labels, series }) {
  const chartData = labels.map((label, index) => {
    const entry = { name: label };
    series.forEach((s) => {
      entry[s.name] = s.data[index];
    });
    return entry;
  });

  return (
    <article className="card rounded-card border border-muted bg-white shadow-soft px-6 py-6">
      <h2 className="h3 text-[color:var(--neutral-900)]">Research Progress Overview</h2>
      <p className="body mt-1 text-[color:var(--neutral-600)]">Track your submission and approval rates over time.</p>
      <div className="mt-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
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

function DashboardContent() {
  return (
    <div className="grid grid-cols-5 gap-5">
      <div className="col-span-12 lg:col-span-12 ">
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-12">
            <header className="card rounded-card border border-transparent bg-white px-8 py-6 shadow-soft">
              <h1 className="h2 text-[color:var(--neutral-900)]">Welcome, Ruth Abebe</h1>
              <p className="body mt-2 text-[color:var(--neutral-600)]">Hereâ€™s whatâ€™s happening with your research today.</p>
            </header>
          </div>

          {KPI_CARDS.map((card) => (
            <div key={card.title} className="col-span-12 sm:col-span-6 lg:col-span-3">
              <StatCard {...card} />
            </div>
          ))}

          <div className="col-span-12 lg:col-span-5 min-h-[260px]">
            <QuickActionsGrid
              items={QUICK_ACTIONS.map((action) => ({
                icon: action.icon,
                label: action.label,
                sublabel: action.sublabel,
                onClick: () => console.log(action.label),
              }))}
            />
          </div>

          <div className="col-span-12 lg:col-span-8 min-h-[260px]">
            <MilestonesProgress items={MILESTONES} />
          </div>

          <div className="col-span-12 lg:col-span-4 min-h-[260px]">
            <EventsTimeline items={[]} />
          </div>

          <div className="col-span-12 lg:col-span-8 min-h-[300px]">
            <ProgressChart labels={CHART_LABELS} series={CHART_SERIES} />
          </div>
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-3 lg:row-span-3 self-start">
        <MessagesPanel items={[]} />
      </aside>
    </div>
  );
}


function PlaceholderContent({ title }) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <section className="card rounded-card border border-muted bg-white px-8 py-12 text-center shadow-soft">
          <h1 className="h2 text-[color:var(--neutral-900)]">{title}</h1>
          <p className="body mt-3 text-[color:var(--neutral-600)]">This section is under construction. Check back soon.</p>
        </section>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");

  let content;
  switch (activeSection) {
    case "Dashboard":
      content = <DashboardContent />;
      break;
    case "Submission":
      content = <SubmissionWorkspace />;
      break;
    case "My Research":
      content = <MyResearchWorkspace />;
      break;
    case "Calendar":
    case "Message":
    case "Settings":
      content = <PlaceholderContent title={activeSection} />;
      break;
    default:
      content = <DashboardContent />;
      break;
  }

  return (
    <AppShell
      sidebar={<Sidebar active={activeSection} onSelect={setActiveSection} />}
      topbar={<Topbar showSearch={activeSection === "Submission"} />}
    >
      {content}
    </AppShell>
  );
}



