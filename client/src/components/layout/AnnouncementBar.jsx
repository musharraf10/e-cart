import { useEffect, useState } from "react";
import api from "../../api/client.js";

export function AnnouncementBar() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/announcements")
      .then(({ data }) => {
        if (mounted) setItems(data || []);
      })
      .catch(() => {
        if (mounted) setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="h-9 bg-accent text-bg-primary flex items-center justify-center text-[11px] font-semibold">
        <span className="opacity-70">Loading offers…</span>
      </div>
    );
  }

  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  const message = items
    ?.map((a) => a.text)
    .filter(Boolean)
    .join("   •   ");

  if (!message) {
    return null;
  }

  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        <span className="announcement-text">{message}</span>
        <span className="announcement-text" aria-hidden>
          {message}
        </span>
      </div>
    </div>
  );
}

