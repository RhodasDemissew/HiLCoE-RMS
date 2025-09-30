import React from 'react';
import { Search, Bell, Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets.js';

const NavHeader = () => {
  const NOTIFICATIONS = [];
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hasNotifications = NOTIFICATIONS.length > 0;

  function handleNotificationToggle() {
    setIsNotificationOpen((prev) => !prev);
  }

  function handleViewNotificationCenter() {
    console.log("View notification center");
    setIsNotificationOpen(false);
  }
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search conferences, research..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notification */}
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
                src={assets.notification}
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

        </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">DM</span>
            </div>
            <span className="font-medium text-gray-700">Dr. Mesfin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;