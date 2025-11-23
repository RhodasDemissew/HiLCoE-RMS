import {
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function SummaryCard({ label, value, trend, icon, loading = false }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--neutral-500)]">{label}</p>
          {loading ? (
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[color:var(--neutral-200)]"></div>
          ) : (
            <p className="mt-3 text-3xl font-semibold text-[color:var(--neutral-900)]">{value}</p>
          )}
          {loading ? (
            <div className="mt-1 h-4 w-20 animate-pulse rounded bg-[color:var(--neutral-200)]"></div>
          ) : trend ? (
            <p className="mt-1 text-xs font-medium text-[color:var(--brand-600)]">{trend} this month</p>
          ) : null}
        </div>
        {icon ? <img src={icon} alt="" className="h-10 w-10" loading="lazy" decoding="async" /> : null}
      </div>
    </article>
  );
}

function ActivityLog({ items, onViewAll }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Activity Log</h2>
          <p className="text-xs text-[color:var(--neutral-500)]">Latest researcher activity</p>
        </div>
        <button 
          type="button" 
          className="text-xs font-semibold text-[color:var(--brand-600)] hover:text-[color:var(--brand-700)]"
          onClick={onViewAll}
        >
          View all
        </button>
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
            {items && items.length > 0 ? items.map((row, idx) => (
              <tr key={`${row.id || row.date}-${idx}`} className="text-[color:var(--neutral-700)]">
                <td className="px-4 py-3 text-sm font-medium">
                  <div>{formatDate(row.date)}</div>
                  <div className="text-xs text-[color:var(--neutral-400)]">{formatTimeAgo(row.date)}</div>
                </td>
                <td className="px-4 py-3 text-sm">{row.author}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    row.status === 'approved' ? 'bg-green-100 text-green-800' :
                    row.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    row.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                    row.status === 'needs_changes' ? 'bg-orange-100 text-orange-800' :
                    row.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    row.status === 'graded' ? 'bg-purple-100 text-purple-800' :
                    row.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {row.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--neutral-500)]">{row.description}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-sm text-[color:var(--neutral-500)]">
                  No recent activity
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}


function MessagesPanel({ messages, loading = false, onViewAll }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Message</h2>
        <button 
          type="button" 
          className="text-xs font-semibold text-[color:var(--brand-600)] hover:text-[color:var(--brand-700)]"
          onClick={onViewAll}
        >
          View All
        </button>
      </header>
      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 animate-pulse rounded bg-[color:var(--neutral-200)]"></div>
                <div className="h-3 w-12 animate-pulse rounded bg-[color:var(--neutral-200)]"></div>
              </div>
              <div className="h-3 w-16 animate-pulse rounded bg-[color:var(--neutral-200)] mb-2"></div>
              <div className="h-3 w-full animate-pulse rounded bg-[color:var(--neutral-200)]"></div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {messages && messages.length > 0 ? messages.map((message) => (
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
          )) : (
            <div className="mt-4 rounded-xl border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[color:var(--neutral-800)]">No recent messages</p>
              <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Start a conversation to see messages here.</p>
            </div>
          )}
        </ul>
      )}
    </article>
  );
}

function PerformanceChart({ data }) {
  const COLORS = ["#3B82F6", "#6366F1", "#F97316", "#0EA5E9", "#22C55E", "#EF4444", "#10B981", "#F59E0B"];
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white px-6 py-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Submissions by Stage</h2>
        <p className="text-xs text-[color:var(--neutral-500)]">Number of submissions for each research stage</p>
      </header>
      <div className="mx-auto w-full overflow-hidden">
        <div className="h-56 sm:h-64 md:h-72 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                wrapperStyle={{ 
                  paddingTop: '8px',
                  fontSize: '9px',
                  fontFamily: 'inherit',
                  lineHeight: '1.1',
                  maxWidth: '100%'
                }}
                iconType="circle"
                layout="horizontal"
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                outerRadius={70}
                innerRadius={35}
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
      </div>
    </article>
  );
}


export default function CoordinatorDashboardWorkspace({
  summary,
  activity,
  messages,
  performance,
  user,
  statsLoading = false,
  messagesLoading = false,
  onNavigateToActivityLog,
  onNavigateToMessages,
}) {
  return (
    <section className="rounded-3xl bg-white px-8 py-8 shadow-sm">
      <header>
        <h1 className="text-3xl font-semibold text-[color:var(--neutral-900)]">Welcome, {user?.name ?? "Coordinator"}</h1>
        <p className="mt-1 text-sm text-[color:var(--neutral-500)]">Today is a good day to make progress</p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} loading={statsLoading} />
        ))}
      </div>

      <div className="mt-8 grid gap-5 grid-cols-1 lg:grid-cols-2">
        <PerformanceChart data={performance} />
        <MessagesPanel messages={messages} loading={messagesLoading} onViewAll={onNavigateToMessages} />
      </div>
      
      <div className="mt-8">
        <ActivityLog items={activity} onViewAll={onNavigateToActivityLog} />
      </div>
    </section>
  );
}

