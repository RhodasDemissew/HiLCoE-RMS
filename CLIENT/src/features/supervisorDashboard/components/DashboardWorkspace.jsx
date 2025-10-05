import { useMemo } from "react";
import messageIcon from "../../../assets/icons/message.png";

function StatCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-[color:var(--neutral-600)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--neutral-900)]">{value}</p>
    </article>
  );
}

function MessagesPanel({ items = [] }) {
  const hasMessages = items.length > 0;
  return (
    <aside className="rounded-2xl border border-[color:var(--neutral-200)] bg-white p-5 shadow-soft h-full flex flex-col" aria-labelledby="sup-messages-title">
      <h2 id="sup-messages-title" className="h3 text-[color:var(--neutral-900)]">Message</h2>
      <div className="mt-4 flex-1 overflow-auto">
        {hasMessages ? (
          <ul className="space-y-3">
            {items.map((m) => (
              <li key={m.id} className="rounded-xl border border-[color:var(--neutral-200)] p-3">
                <div className="text-sm font-semibold text-[color:var(--neutral-900)]">{m.author || 'Student'}</div>
                <div className="text-xs text-[color:var(--neutral-600)]">{m.body || m.subject}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[color:var(--neutral-200)] bg-white/50 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10">
              <img src={messageIcon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium text-[color:var(--neutral-700)]">No messages yet.</p>
            <p className="mt-1 text-xs text-[color:var(--neutral-500)]">You will see updates from students here.</p>
          </div>
        )}
      </div>
      <button type="button" className="btn mt-4 w-full rounded-[14px] py-3 text-sm font-semibold">View All Messages</button>
    </aside>
  );
}

export default function SupervisorDashboardWorkspace({ user, kpis = [], messages = [] }) {
  const resolved = useMemo(() => (Array.isArray(kpis) && kpis.length ? kpis : [{ title: 'Students', value: 0 }, { title: 'Pending Reviews', value: 0 }, { title: 'Approved This Week', value: 0 }, { title: 'Needs Changes', value: 0 }]), [kpis]);

  const displayName = user?.name || 'Supervisor';

  return (
    <>
      <header className="mb-6 rounded-2xl border border-transparent bg-white px-8 py-6 shadow-soft">
        <h1 className="h2 text-[color:var(--neutral-900)]">Welcome, {displayName}</h1>
        <p className="body mt-2 text-[color:var(--neutral-600)]">Today is a good day to make progress</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Stats */}
        <section className="col-span-12 lg:col-span-8" aria-labelledby="sup-metrics-title">
          <h2 id="sup-metrics-title" className="sr-only">Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {resolved.map((c) => (
              <StatCard key={c.title} {...c} />
            ))}
          </div>
        </section>

        {/* Messages right rail */}
        <aside className="col-span-12 lg:col-span-4 lg:row-span-3 lg:row-start-1">
          <MessagesPanel items={messages} />
        </aside>

        {/* Paper Review shortcut */}
        <section className="col-span-12 lg:col-span-8" aria-labelledby="sup-reviews-title">
          <article className="rounded-2xl border border-[color:var(--neutral-200)] bg-white p-5 shadow-soft min-h-[240px]">
            <h2 id="sup-reviews-title" className="h3 text-[color:var(--neutral-900)]">Paper Review</h2>
            <p className="body mt-1 text-[color:var(--neutral-600)]">Go to My Reviews to approve or request changes.</p>
            <div className="mt-4">
              <a href="/supervisor#my-reviews" className="text-sm font-semibold text-[color:var(--brand-600)] hover:underline">Open My Reviews</a>
            </div>
          </article>
        </section>
      </div>
    </>
  );
}

