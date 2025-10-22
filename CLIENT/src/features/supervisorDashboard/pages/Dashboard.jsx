import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, API_BASE, getToken } from "../../../api/client.js";
import logoImage from "../../../assets/images/logo.png";
import settingsIcon from "../../../assets/icons/settings.png";
import notificationIcon from "../../../assets/icons/notification.png";
import SupervisorDashboardWorkspace from "../components/DashboardWorkspace.jsx";
import ReviewWorkspace from "../../coordinatorDashboard/components/ReviewWorkspace.jsx";
import MessagingWorkspace from "../../../shared/components/MessagingWorkspace.jsx";
import { supNav, supKpis, supCopy } from "../content.js";

function AppShell({ sidebar, topbar, children }) {
  return (
    <div className="min-h-screen bg-[color:var(--neutral-100)]">
      {sidebar}
      <div className="ml-[260px] flex min-h-screen flex-col">
        {topbar}
        <main className="flex-1 overflow-y-auto">
          <div className="m-8 mt-0 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ items, active, onSelect }) {
  return (
    <aside className="fixed inset-y-0 left-0 w-[260px] bg-blue-950 text-white">
      <div className="flex h-full flex-col">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="HiLCoE" className="h-12 w-12 rounded-full" loading="lazy" decoding="async" />
            <div>
              <div className="font-semibold text-lg">HiLCoE</div>
              <div className="text-xs text-white/70">Research Management</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-400 left-0 mb-5 w-65 h-0.5"></div>
        <nav className="flex-1 space-y-2 px-4">
          {items.map((item) => {
            const isActive = item.label === active;
            return (
              <button
                key={item.label}
                type="button"
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive ? "bg-white/10 text-white " : "text-white/80 hover:bg-white/10",
                ].join(" ")}
                onClick={() => onSelect?.(item.label)}
              >
                {item.icon ? (
                  <img src={item.icon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
                ) : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="bg-gray-400 left-0  w-65 h-0.5"></div>
        <div className="px-4 pb-6 pt-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
            onClick={() => onSelect?.("Settings")}
          >
            <img src={settingsIcon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ user, notifications = [], onMarkAllRead, onClearAll }) {
  const navigate = useNavigate();
  const displayName = user?.name || "Supervisor";
  const userInitials = (displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => (s[0] || '').toUpperCase()).join('')) || 'S';
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  function nameInitials(name = '') {
    return (name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => (s[0] || '').toUpperCase()).join('')) || '';
  }
  function fmt(n) {
    const title = String(n.type || 'notification').replace(/_/g, ' ');
    const p = n.payload || {};
    const descParts = [];
    if (p.name) descParts.push(p.name);
    const desc = descParts.join(' · ');
    const time = n.created_at ? new Date(n.created_at).toLocaleString() : '';
    const actorName = p.actor_name || '';
    return { id: String(n._id || n.id || Math.random()), title, description: desc, time, actorName, actorInitials: nameInitials(actorName) };
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem('userRole');
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-[color:var(--neutral-200)] bg-white/70 backdrop-blur">
      <div className="mr-10 flex h-20 items-center justify-between gap-6">
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          <div className="relative" ref={notificationRef}>
            <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--brand-600)] shadow-soft" onClick={() => setIsNotificationOpen((p) => !p)} aria-label="Notifications" aria-expanded={isNotificationOpen}>
              <img src={notificationIcon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
              <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--brand-600)] text-xs font-semibold text-white">{unreadCount}</span>
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 z-20 mt-4 w-80 rounded-[18px] border border-[color:var(--neutral-200)] bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[color:var(--neutral-900)]">Notifications</div>
                  <span className="text-xs text-[color:var(--neutral-500)]">{unreadCount ? `${unreadCount} new` : notifications.length ? 'All read' : 'No alerts'}</span>
                </div>
                {notifications.length ? (
                  <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                    <button type="button" className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)]" onClick={onMarkAllRead}>Mark all read</button>
                    <button type="button" className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-600 hover:bg-red-100" onClick={onClearAll}>Clear all</button>
                  </div>
                ) : null}
                {notifications.length ? (
                  <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto">
                    {notifications.map((n) => {
                      const item = fmt(n);
                      return (
                        <li key={item.id} className="flex items-start gap-3 rounded-[14px] border border-[color:var(--neutral-200)] bg-[color:var(--neutral-100)] px-4 py-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10 text-[11px] font-semibold text-[color:var(--brand-700)]">{item.actorInitials || '�'}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[color:var(--neutral-900)]">{item.title}</div>
                            <div className="mt-0.5 text-xs text-[color:var(--neutral-600)]">
                              {item.actorName ? (<>
                                <span className="font-medium text-[color:var(--neutral-800)]">{item.actorName}</span>
                                {item.description ? ` · ${item.description}` : ''}
                              </>) : item.description }
                            </div>
                            <span className="mt-1 inline-block text-[10px] text-[color:var(--neutral-500)]">{item.time}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-[14px] border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-100)] px-4 py-6 text-center">
                    <p className="text-sm font-semibold text-[color:var(--neutral-800)]">You're all caught up</p>
                    <p className="mt-1 text-xs text-[color:var(--neutral-500)]">We'll notify you when there's an update.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative" ref={profileMenuRef}>
            <button type="button" className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-left shadow-soft" onClick={() => setIsProfileOpen((p) => !p)} aria-expanded={isProfileOpen} aria-haspopup="menu">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10 text-sm font-semibold text-[color:var(--brand-600)]">{userInitials}</span>
              <div className="text-xs text-[color:var(--neutral-600)]">
                <div className="font-semibold text-[color:var(--neutral-900)]">{displayName}</div>
                Supervisor
              </div>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 z-20 mt-3 w-48 rounded-[14px] border border-[color:var(--neutral-200)] bg-white p-3 shadow-soft" role="menu" aria-label="Profile actions">
                <button type="button" className="w-full rounded-[10px] px-4 py-2 text-sm font-semibold text-[color:var(--brand-600)] transition hover:bg-[color:var(--neutral-100)]" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
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

export default function SupervisorDashboardPage() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState({ name: "Dr. Supervisor", role: "Supervisor" });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await api('/auth/me');
        const data = await res.json().catch(() => null);
        if (mounted && res.ok && data) setUser((prev) => ({ ...prev, ...data }));
      } catch {}
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  // Notifications: initial load + SSE subscription (no polling)
  useEffect(() => {
    let stopped = false;
    async function load() {
      try {
        const res = await api('/notifications', { cache: 'no-store' });
        if (res.status === 304 || res.status === 204) return; // don't clobber state on not-modified/empty responses
        if (!res.ok) return;
        const data = await res.json().catch(() => ([]));
        if (!stopped) setNotifications(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
      } catch {}
    }
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const url = `${API_BASE}/notifications/stream?token=${encodeURIComponent(getToken() || '')}`;
    const es = new EventSource(url);
    const onNotification = (ev) => {
      try {
        const n = JSON.parse(ev.data || '{}');
        setNotifications((prev) => [n, ...prev]);
      } catch {}
    };
    es.addEventListener('notification', onNotification);
    es.addEventListener('error', () => {});
    return () => {
      stopped = true;
      window.removeEventListener('focus', onFocus);
      try { es.close(); } catch {}
    };
  }, []);

  async function loadNotifications() {
    try {
      const res = await api('/notifications', { cache: 'no-store' });
      if (res.status === 304 || res.status === 204) return;
      if (!res.ok) return;
      const data = await res.json().catch(() => ([]));
      setNotifications(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch {}
  }

  async function markAllRead() {
    try { await api('/notifications/read-all', { method: 'PATCH' }); } catch {}
    loadNotifications();
  }

  async function clearAll() {
    try { await api('/notifications', { method: 'DELETE' }); } catch {}
    loadNotifications();
  }

  let content;
  switch (activeSection) {
    case "Dashboard":
      content = <SupervisorDashboardWorkspace user={user} kpis={supKpis} />;
      break;
    case "My Reviews":
      content = <ReviewWorkspace hideSynopsis />;
      break;
    case "Message":
      content = (
        <MessagingWorkspace
          currentUser={user}
          roleLabel={user?.role || 'Supervisor'}
          emptyStateTitle="Collaborate with your researcher and coordinator."
        />
      );
      break;
    case "Calendar":
      content = <PlaceholderContent title={activeSection} />;
      break;
    default:
      content = <SupervisorDashboardWorkspace user={user} kpis={supKpis} />;
      break;
  }

  return (
    <AppShell
      sidebar={<Sidebar items={supNav} active={activeSection} onSelect={setActiveSection} />}
      topbar={<Topbar user={user} notifications={notifications} onMarkAllRead={markAllRead} onClearAll={clearAll} />}
    >
      {content}
    </AppShell>
  );
}




