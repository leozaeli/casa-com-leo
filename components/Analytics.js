'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

function getSessionId() {
  try {
    let id = sessionStorage.getItem('ccl_sid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('ccl_sid', id);
    }
    return id;
  } catch {
    return null;
  }
}

function ping(sessionId, path, type) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, path, type }),
    keepalive: true,
  }).catch(() => {});
}

export default function Analytics() {
  const pathname = usePathname();
  const sessionIdRef = useRef(null);

  useEffect(() => {
    if (!sessionIdRef.current) sessionIdRef.current = getSessionId();
    if (!sessionIdRef.current) return;
    ping(sessionIdRef.current, pathname, 'pageview');
  }, [pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!sessionIdRef.current) return;
      ping(sessionIdRef.current, window.location.pathname, 'heartbeat');
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
