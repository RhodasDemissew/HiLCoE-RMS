import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function SummaryCard({ label, value, trend, icon }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--neutral-500)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--neutral-900)]">{value}</p>
          {trend ? <p className="mt-1 text-xs font-medium text-[color:var(--brand-600)]">{trend} this month</p> : null}
        </div>
        {icon ? <img src={icon} alt="" className="h-10 w-10" loading="lazy" decoding="async" /> : null}
      </div>
    </article>
  );
}

function ActivityLog({ items }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Activity Log</h2>
          <p className="text-xs text-[color:var(--neutral-500)]">Latest coordinator activity</p>
        </div>
        <button type="button" className="text-xs font-semibold text-[color:var(--brand-600)]">View all</button>
      </header>
      <div className="overflow-hidden rounded-xl border border-[color:var(--neutral-200)]">
        <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left text-sm">
          <thead className="bg-[color:var(--neutral-50)]">
            <tr className="text-[color:var(--neutral-600)]">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--neutral-200)]">
            {items.map((row, idx) => (
              <tr key={`${row.date}-${idx}`} className="text-[color:var(--neutral-700)]">
                <td className="px-4 py-3 text-sm font-medium">{row.date}</td>
                <td className="px-4 py-3 text-sm">{row.author}</td>
                <td className="px-4 py-3 text-sm">{row.action}</td>
                <td className="px-4 py-3 text-sm text-[color:var(--neutral-500)]">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function EventsPanel({ events }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Events and Deadlines</h2>
        <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Keep track of upcoming milestones</p>
      </header>
      <ul className="mt-4 space-y-4">
        {events.map((event, idx) => (
          <li key={idx} className="flex items-start gap-3 rounded-xl bg-[color:var(--neutral-50)] px-4 py-3">
            <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10 text-[color:var(--brand-600)]">�</span>
            <div>
              <p className="text-sm font-semibold text-[color:var(--neutral-900)]">{event.title}</p>
              <p className="text-xs text-[color:var(--neutral-500)]">{event.date}</p>
              {event.owner ? <p className="text-xs text-[color:var(--neutral-400)]">{event.owner}</p> : null}
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-ghost mt-4 w-full rounded-xl py-3 text-sm font-semibold">
        View Full Calendar
      </button>
    </article>
  );
}

function MessagesPanel({ messages }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Message</h2>
        <button type="button" className="text-xs font-semibold text-[color:var(--brand-600)]">View All</button>
      </header>
      <ul className="mt-4 space-y-3">
        {messages.map((message) => (
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
    </article>
  );
}

function PerformanceChart({ data }) {
  const COLORS = ["#3B82F6", "#6366F1", "#F97316", "#0EA5E9", "#22C55E"];
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Server/AI Performance</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">System utilisation overview</p>
      </header>
      <div className="mx-auto h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`slice-${entry.label}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function ResearchStats({ labels, series }) {
  const chartData = labels.map((label, idx) => {
    const row = { name: label };
    series.forEach((item) => {
      row[item.year] = item.values[idx];
    });
    return row;
  });
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Research stats</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">Year over year comparison</p>
      </header>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="coordColorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="coordColorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="coordColorC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
            <XAxis dataKey="name" stroke="rgba(15,23,42,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(15,23,42,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            {series.map((item, idx) => (
              <Area
                key={item.year}
                type="monotone"
                dataKey={item.year}
                stroke={idx === 0 ? "#3B82F6" : idx === 1 ? "#0EA5E9" : "#A855F7"}
                fill={idx === 0 ? "url(#coordColorA)" : idx === 1 ? "url(#coordColorB)" : "url(#coordColorC)"}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default function CoordinatorDashboardWorkspace({
  summary,
  activity,
  events,
  messages,
  performance,
  researchLabels,
  researchSeries,
  user,
}) {
  return (
    <section className="rounded-3xl bg-white px-8 py-8 shadow-sm">
      <header>
        <h1 className="text-3xl font-semibold text-[color:var(--neutral-900)]">Welcome, {user?.name ?? "Coordinator"}</h1>
        <p className="mt-1 text-sm text-[color:var(--neutral-500)]">Today is a good day to make progress</p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <ActivityLog items={activity} />
          <div className="grid gap-5 lg:grid-cols-2">
            <PerformanceChart data={performance} />
            <EventsPanel events={events} />
          </div>
        </div>
        <div className="space-y-5">
          <MessagesPanel messages={messages} />
        </div>
        <div className="xl:col-span-2">
          <ResearchStats labels={researchLabels} series={researchSeries} />
        </div>
        
      </div>
    </section>
  );
}
