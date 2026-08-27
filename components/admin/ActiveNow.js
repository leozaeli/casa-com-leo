'use client';

import { useEffect, useState } from 'react';

function timeAgo(iso) {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `há ${diff}s`;
  return `há ${Math.floor(diff / 60)}min`;
}

function locationLabel(session) {
  const parts = [session.city, session.region, session.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Localização desconhecida';
}

export default function ActiveNow() {
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/admin/active', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSessions(data.sessions);
      } catch {
        // ignore transient errors, next poll retries
      }
    }

    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="admin-stat-card admin-stat-card-live">
      <span>Ativos agora</span>
      <strong>{sessions === null ? '—' : sessions.length}</strong>
      {sessions && sessions.length > 0 && (
        <ul className="admin-active-list">
          {sessions.slice(0, 6).map((session) => (
            <li key={session.session_id}>
              <span className="admin-active-dot"></span>
              {locationLabel(session)} · {session.path} · {timeAgo(session.last_seen)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
