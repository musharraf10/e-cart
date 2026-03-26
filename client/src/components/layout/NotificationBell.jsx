import { useEffect, useMemo, useState, useRef } from "react";
import { HiBell } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  useEffect(() => {
    function handleScroll() {
      setOpen((prev) => (prev ? false : prev));
    }

    if (open) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  // Fetch notifications
  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        const { data } = await api.get("/notifications");
        if (!mounted) return;
        setNotifications(data.notifications || []);
      } catch {
        // ignore errors
      }
    }

    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // ✅ Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleClickNotification = async (item) => {
    try {
      if (!item.isRead) {
        await api.patch(`/notifications/${item._id}/read`);
      }
    } catch { }

    setNotifications((current) =>
      current.map((entry) =>
        entry._id === item._id ? { ...entry, isRead: true } : entry
      )
    );

    setOpen(false);
    if (item.link) navigate(item.link);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="relative p-2 rounded-xl text-white/80 hover:text-[#d4af37] transition-colors"
        aria-label="Notifications"
      >
        <HiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-primary text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="fixed left-0 right-0 top-16 mx-2 max-h-96 overflow-auto rounded-xl border border-[#262626] bg-[#111111] shadow-2xl z-50"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#262626] text-sm font-semibold text-white">
            Notifications
          </div>

          {/* Content */}
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400">
              No notifications yet.
            </p>
          ) : (
            <ul>
              {notifications.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => handleClickNotification(item)}
                    className={`w-full text-left px-4 py-3 border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors ${item.isRead ? "opacity-70" : ""
                      }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.message}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}