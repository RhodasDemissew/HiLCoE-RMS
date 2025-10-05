import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../../../api/client.js";

import settingsIcon from "../../../assets/icons/settings.png";
import notificationIcon from "../../../assets/icons/notification.png";
import logoImage from "../../../assets/images/logo.png";
import CoordinatorDashboardWorkspace from "../components/DashboardWorkspace.jsx";
import CoordinatorUsersWorkspace from "../components/UsersWorkspace.jsx";
import ReviewWorkspace from "../components/ReviewWorkspace.jsx";
import TemplatesWorkspace from "../components/TemplatesWorkspace.jsx";
import ScheduleSynopsis from "../components/ScheduleSynopsis.jsx";
import {
  coordinatorActivity,
  coordinatorEvents,
  coordinatorMessages,
  coordinatorNav,
  coordinatorPerformance,
  coordinatorResearchLabels,
  coordinatorResearchSeries,
  coordinatorSummary,
} from "../content.js";

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

function Sidebar({ items, active, onSelect }) {
  const hasSettingsNavItem = Array.isArray(items) && items.some((item) => item?.label === "Settings");
  const [openGroups, setOpenGroups] = useState({ Schedule: true });
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
          {items.map((item) => {
            const isGroup = Array.isArray(item.children) && item.children.length;
            if (!isGroup) {
              const isActive = item.label === active;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                    isActive ? "bg-white/10 text-white border-l-4 border-[color:var(--brand-600)]" : "text-white/80 hover:bg-white/10",
                  ].join(" ")}
                  onClick={() => onSelect?.(item.label)}
                >
                  {item.icon ? (
                    <img src={item.icon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
                  ) : null}
                  <span>{item.label}</span>
                </button>
              );
            }
            const open = !!openGroups[item.label];
            const isAnyChildActive = item.children.some((c) => c.label === active);
            return (
              <div key={item.label} className="space-y-1">
                <button
                  type="button"
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition",
                    isAnyChildActive ? "bg-white/10 text-white border-l-4 border-[color:var(--brand-600)]" : "text-white/80 hover:bg-white/10",
                  ].join(" ")}
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                >
                  <span className="flex items-center gap-3">
                    {item.icon ? (
                      <img src={item.icon} alt="" className="h-5 w-5" loading="lazy" decoding="async" aria-hidden />
                    ) : null}
                    <span>{item.label}</span>
                  </span>
                  <span aria-hidden className="text-xs opacity-80">{open ? '▾' : '▸'}</span>
                </button>
                {open && (
                  <div className="ml-8 space-y-1">
                    {item.children.map((child) => {
                      const childActive = child.label === active;
                      return (
                        <button
                          key={child.label}
                          type="button"
                          className={[
                            "flex w-full items-center rounded-lg px-3 py-2 text-sm transition",
                            childActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10",
                          ].join(" ")}
                          onClick={() => onSelect?.(child.label)}
                        >
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!hasSettingsNavItem && (
          <div className="px-4 pb-6 pt-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              onClick={() => onSelect?.("Settings")}
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
        )}
      </div>
    </aside>
  );
}

function Topbar({ showSearch = true, user, notifications = [], onMarkAllRead, onClearAll }) {
  const navigate = useNavigate();
  const displayName = user?.name || "Coordinator";
  const displayRole = user?.role || "Coordinator";
  const userInitials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => (part[0] || '').toUpperCase())
      .join('') ||
    'C';
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const hasNotifications = notifications.length > 0;

  function nameInitials(name = '') {
    return (name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => (s[0] || '').toUpperCase()).join('')) || '';
  }
  function fmt(n) {
    const title = String(n.type || 'notification').replace(/_/g, ' ');
    const p = n.payload || {};
    const descParts = [];
    if (p.stage) descParts.push(`Stage: ${p.stage}`);
    if (p.subject_name) descParts.push(`Student: ${p.subject_name}`);
    const desc = descParts.join(' · ');
    const time = n.created_at ? new Date(n.created_at).toLocaleString() : '';
    const actorName = p.actor_name || '';
    return { id: String(n._id || n.id || Math.random()), title, description: desc, time, actorName, actorInitials: nameInitials(actorName) };
  }

  useEffect(() => {
    if (!isNotificationOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
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

  useEffect(() => {
    if (!isProfileOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  function handleNotificationToggle() {
    setIsProfileOpen(false);
    setIsNotificationOpen((prev) => !prev);
  }

  function handleProfileToggle() {
    setIsNotificationOpen(false);
    setIsProfileOpen((prev) => !prev);
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem('userRole');
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-[color:var(--neutral-200)] bg-white/70 backdrop-blur">
      <div className="container-px flex h-20 items-center justify-between gap-6">
        {showSearch ? (
          <form className="relative w-full max-w-xl" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="coordinator-search" className="sr-only">
              Search submissions, research...
            </label>
            <input
              id="coordinator-search"
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
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--brand-600)] shadow-soft"
              onClick={handleNotificationToggle}
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
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
                {unreadCount}
              </span>
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 z-20 mt-4 w-80 rounded-[18px] border border-[color:var(--neutral-200)] bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[color:var(--neutral-900)]">Notifications</h3>
                  <span className="text-xs text-[color:var(--neutral-500)]">
                    {unreadCount ? `${unreadCount} new` : hasNotifications ? 'All read' : 'No alerts'}
                  </span>
                </div>

                {hasNotifications && (
                  <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                    <button type="button" className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)]" onClick={onMarkAllRead}>Mark all read</button>
                    <button type="button" className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-600 hover:bg-red-100" onClick={onClearAll}>Clear all</button>
                  </div>
                )}

                {hasNotifications ? (
                  <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto">
                    {notifications.map((n) => {
                      const item = fmt(n);
                      return (
                        <li key={item.id} className="flex items-start gap-3 rounded-[14px] border border-[color:var(--neutral-200)] bg-[color:var(--neutral-100)] px-4 py-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10 text-[11px] font-semibold text-[color:var(--brand-700)]">
                            {item.actorInitials || 'â€¢'}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[color:var(--neutral-900)]">{item.title}</div>
                            <div className="mt-0.5 text-xs text-[color:var(--neutral-600)]">
                              {item.actorName ? (<>
                                <span className="font-medium text-[color:var(--neutral-800)]">{item.actorName}</span>
                                {item.description ? ` Â· ${item.description}` : ''}
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
            <button
              type="button"
              className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-left shadow-soft"
              onClick={handleProfileToggle}
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10 text-sm font-semibold text-[color:var(--brand-600)]">
                {userInitials}
              </span>
              <div className="text-xs text-[color:var(--neutral-600)]">
                <div className="font-semibold text-[color:var(--neutral-900)]">{displayName}</div>
                {displayRole}
              </div>
            </button>

            {isProfileOpen && (
              <div
                className="absolute right-0 z-20 mt-3 w-48 rounded-[14px] border border-[color:var(--neutral-200)] bg-white p-3 shadow-soft"
                role="menu"
                aria-label="Profile actions"
              >
                <button
                  type="button"
                  className="w-full rounded-[10px] px-4 py-2 text-sm font-semibold text-[color:var(--brand-600)] transition hover:bg-[color:var(--neutral-100)]"
                  onClick={handleLogout}
                >
                  Logout
                </button>
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

export default function CoordinatorDashboardPage() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState({ name: "Dr Mesfin", role: "Coordinator" });
  const [userLoading, setUserLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        setUserLoading(true);
        const res = await api('/auth/me');
        const data = await res.json().catch(() => null);
        if (mounted && res.ok && data) {
          setUser((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.warn('Coordinator profile fetch failed', error);
      } finally {
        if (mounted) setUserLoading(false);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Notifications: fetch on mount, focus, and light polling
  useEffect(() => {
    let stopped = false;
    async function load() {
      try {
        const res = await api('/notifications', { cache: 'no-store' });
        if (res.status === 304 || res.status === 204) return;
        if (!res.ok) return;
        const data = await res.json().catch(() => ([]));
        if (!stopped) setNotifications(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
      } catch {}
    }
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const id = setInterval(load, 20000);
    return () => { stopped = true; window.removeEventListener('focus', onFocus); clearInterval(id); };
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

  const performanceData = useMemo(
    () => coordinatorPerformance.map((item) => ({ label: item.label, value: item.value })),
    []
  );

  const workspaceProps = {
    summary: coordinatorSummary,
    activity: coordinatorActivity,
    events: coordinatorEvents,
    messages: coordinatorMessages,
    performance: performanceData,
    researchLabels: coordinatorResearchLabels,
    researchSeries: coordinatorResearchSeries,
    user,
  };

  let content;
  switch (activeSection) {
    case "Dashboard":
      content = <CoordinatorDashboardWorkspace {...workspaceProps} />;
      break;
    case "Users":
      content = <CoordinatorUsersWorkspace />;
      break;
    case "Research Stats":
      content = <ReviewWorkspace />;
      break;
    case "Templates":
      content = <TemplatesWorkspace />;
      break;
    case "Synopsis Scheduling":
      content = <ScheduleSynopsis />;
      break;
    case "Defense Scheduling":
      content = <PlaceholderContent title={activeSection} />;
      break;
    case "View Calendar":
      content = <PlaceholderContent title={activeSection} />;
      break;
    default:
      content = <PlaceholderContent title={activeSection} />;
      break;
  }

  return (
    <AppShell
      sidebar={<Sidebar items={coordinatorNav} active={activeSection} onSelect={setActiveSection} />}
      topbar={<Topbar user={user} notifications={notifications} onMarkAllRead={markAllRead} onClearAll={clearAll} showSearch={activeSection === "Dashboard" && !userLoading} />}
    >
      {content}
    </AppShell>
  );
}

















