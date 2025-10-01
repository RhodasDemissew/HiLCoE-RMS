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
import {
  coordinatorActivity,
  coordinatorEvents,
  coordinatorMessages,
  coordinatorNav,
  coordinatorNotifications,
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
                onClick={() => onSelect?.(item.label)}
              >
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt=""
                    className="h-5 w-5"
                    loading="lazy"
                    decoding="async"
                    aria-hidden
                  />
                ) : null}
                <span>{item.label}</span>
              </button>
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

function Topbar({ showSearch = true, user, notifications = [] }) {
  const navigate = useNavigate();
  const displayName = user?.name || "Coordinator";
  const displayRole = user?.role || "Coordinator";
  const initials =
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
  const hasNotifications = notifications.length > 0;

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
                {notifications.length}
              </span>
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 z-20 mt-4 w-80 rounded-[18px] border border-[color:var(--neutral-200)] bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[color:var(--neutral-900)]">Notifications</h3>
                  <span className="text-xs text-[color:var(--neutral-500)]">
                    {hasNotifications ? `${notifications.length} new` : "No new alerts"}
                  </span>
                </div>

                {hasNotifications ? (
                  <ul className="mt-4 space-y-3">
                    {notifications.map((item) => (
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
                {initials}
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
    default:
      content = <PlaceholderContent title={activeSection} />;
      break;
  }

  return (
    <AppShell
      sidebar={<Sidebar items={coordinatorNav} active={activeSection} onSelect={setActiveSection} />}
      topbar={<Topbar user={user} notifications={coordinatorNotifications} showSearch={activeSection === "Dashboard" && !userLoading} />}
    >
      {content}
    </AppShell>
  );
}












