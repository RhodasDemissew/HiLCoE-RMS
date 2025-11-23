import { useMemo } from "react";
import messageIcon from "../../../assets/icons/message.png";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const PERFORMANCE_COLORS = ["#3B82F6", "#6366F1", "#F97316", "#22C55E", "#A855F7"];

const STATUS_META = {
  under_review: { label: "Under Review", cls: "bg-blue-50 text-blue-700" },
  awaiting_coordinator: { label: "Awaiting Coordinator", cls: "bg-indigo-50 text-indigo-700" },
  needs_changes: { label: "Needs Changes", cls: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600" },
};

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "-";
  }
}

function formatRelative(value) {
  if (!value) return "";
  try {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    if (Number.isNaN(diffMs)) return "";
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
}

function SummaryCard({ label, value, subtitle, loading = false }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--neutral-500)]">{label}</p>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[color:var(--neutral-200)]" />
      ) : (
        <p className="mt-3 text-3xl font-semibold text-[color:var(--neutral-900)]">{value ?? 0}</p>
      )}
      {subtitle ? (
        loading ? (
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[color:var(--neutral-200)]" />
        ) : (
          <p className="mt-2 text-xs font-medium text-[color:var(--neutral-500)]">{subtitle}</p>
        )
      ) : null}
    </article>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status ? status.replace(/_/g, " ") : "-", cls: "bg-[color:var(--neutral-100)] text-[color:var(--neutral-600)]" };
  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>;
}

function ReviewCard({ stats, latest, loading }) {
  const blocks = [
    { label: "Pending Reviews", value: stats?.pending ?? 0 },
    { label: "Awaiting Coordinator", value: stats?.awaitingCoordinator ?? 0 },
    { label: "Needs Changes", value: stats?.needsChanges ?? 0 },
  ];

  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Paper Review</h2>
          <p className="text-xs text-[color:var(--neutral-500)]">Track submissions that need your attention</p>
        </div>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {blocks.map((item) => (
          <div key={item.label} className="rounded-xl border border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">{item.label}</p>
            {loading ? (
              <div className="mx-auto mt-2 h-6 w-10 animate-pulse rounded bg-[color:var(--neutral-200)]" />
            ) : (
              <p className="mt-2 text-2xl font-semibold text-[color:var(--neutral-900)]">{item.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[color:var(--neutral-700)]">Recent submissions</h3>
        {loading ? (
          <div className="mt-3 space-y-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-16 animate-pulse rounded-xl bg-[color:var(--neutral-100)]" />
            ))}
          </div>
        ) : latest?.length ? (
          <ul className="mt-3 space-y-3">
            {latest.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-3 rounded-xl border border-[color:var(--neutral-200)] bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[color:var(--neutral-900)]">{entry.title || entry.stage}</p>
                  <p className="text-xs text-[color:var(--neutral-500)]">
                    {entry.stage} • {entry.researcher?.name || "Unknown researcher"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-right lg:flex-row lg:items-center lg:gap-4">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-[color:var(--neutral-500)]">{formatDate(entry.submittedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-8 text-center text-sm text-[color:var(--neutral-500)]">
            No submissions yet. You’ll see new activity here once your students start uploading.
          </div>
        )}
      </div>
    </article>
  );
}

function MessagesPanel({ messages, loading, onOpenAll }) {
  const hasMessages = Array.isArray(messages) && messages.length > 0;
  const handleOpenAll = () => {
    if (typeof onOpenAll === "function") onOpenAll();
  };

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Messages</h2>
        <button
          type="button"
          className="text-xs font-semibold text-[color:var(--brand-600)] hover:text-[color:var(--brand-500)]"
          onClick={handleOpenAll}
        >
          Open Inbox
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-16 animate-pulse rounded-xl bg-[color:var(--neutral-100)]" />
            ))}
          </div>
        ) : hasMessages ? (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li key={message.id} className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--neutral-900)]">{message.title || "Conversation"}</p>
                    <p className="text-xs text-[color:var(--neutral-500)]">{message.preview || "No preview available."}</p>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--neutral-400)]">
                    {formatRelative(message.createdAt)}
                  </span>
                </div>
                {message.unread ? (
                  <span className="mt-2 inline-flex rounded-full bg-[color:var(--brand-600)]/10 px-2 py-1 text-[10px] font-semibold text-[color:var(--brand-700)]">
                    {message.unread} unread
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[color:var(--neutral-200)] bg-white/60 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10">
              <img src={messageIcon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium text-[color:var(--neutral-700)]">No messages yet.</p>
            <p className="mt-1 text-xs text-[color:var(--neutral-500)]">You’ll see updates from researchers once conversations begin.</p>
          </div>
        )}
      </div>
      <button
        type="button"
        className="btn mt-5 w-full rounded-[14px] py-3 text-sm font-semibold"
        onClick={handleOpenAll}
      >
        View All Messages
      </button>
    </aside>
  );
}

function PerformanceChart({ data, loading }) {
  const hasData = Array.isArray(data) && data.some((item) => item.value > 0);

  if (loading) {
    return (
      <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
        <div className="mb-4">
          <div className="h-6 w-40 animate-pulse rounded bg-[color:var(--neutral-200)]" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-[color:var(--neutral-200)]" />
        </div>
        <div className="h-60 animate-pulse rounded-2xl bg-[color:var(--neutral-100)]" />
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Submission Overview</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">Distribution by review status for your assigned researchers</p>
      </header>
      {hasData ? (
        <div className="mx-auto w-full">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                height={60}
                wrapperStyle={{ 
                  paddingTop: '12px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  lineHeight: '1.3',
                  maxWidth: '100%'
                }}
                iconType="circle"
                layout="horizontal"
              />
              <Pie data={data} dataKey="value" nameKey="label" outerRadius={110} innerRadius={70} paddingAngle={2} strokeWidth={0}>
                {data.map((entry, index) => (
                  <Cell key={entry.key || entry.label} fill={PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-6 py-12 text-center text-sm text-[color:var(--neutral-500)]">
          No submissions yet to visualise. Once your students submit documents, their progress will appear here.
        </div>
      )}
    </article>
  );
}

export default function SupervisorDashboardWorkspace({
  user,
  overview,
  loading = false,
  error = "",
  onRefresh,
  onOpenMessages,
}) {
  const displayName = user?.name || "Supervisor";
  const stats = overview?.stats || {};
  const handleOpenMessages = typeof onOpenMessages === "function" ? onOpenMessages : () => {};

  const summaryItems = useMemo(() => {
    const studentsTotal = stats?.students?.total ?? 0;
    const studentsCapacity = stats?.students?.capacity ?? null;
    return [
      {
        label: "Students",
        value: studentsTotal,
        subtitle: studentsCapacity ? `${studentsTotal}/${studentsCapacity} assigned` : null,
      },
      {
        label: "Pending Reviews",
        value: stats?.pendingReviews ?? 0,
        subtitle: stats?.awaitingCoordinator ? `${stats.awaitingCoordinator} awaiting coordinator` : null,
      },
      {
        label: "Approved This Week",
        value: stats?.approvedThisWeek ?? 0,
        subtitle: "Past 7 days",
      },
      {
        label: "Needs Changes",
        value: stats?.needsChanges ?? 0,
        subtitle: stats?.needsChanges ? "Requires follow-up" : null,
      },
    ];
  }, [stats]);

  return (
    <section className="rounded-3xl bg-white px-8 py-8 shadow-sm">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--neutral-900)]">Welcome, {displayName}</h1>
          <p className="text-sm text-[color:var(--neutral-500)]">Today is a good day to make progress</p>
        </div>
        <div className="flex items-center gap-3">
          {onRefresh ? (
            <button
              type="button"
              className="rounded-[14px] border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-700)] transition hover:bg-[color:var(--neutral-100)]"
              onClick={onRefresh}
            >
              Refresh
            </button>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} loading={loading} />
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <ReviewCard stats={overview?.review} latest={overview?.review?.latest} loading={loading} />
          <PerformanceChart data={overview?.performance} loading={loading} />
        </div>
        <MessagesPanel messages={overview?.messages} loading={loading} onOpenAll={handleOpenMessages} />
      </div>
    </section>
  );
}
