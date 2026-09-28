'use client';
import { useEffect, useState } from 'react';
export function Pwa() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);
  return offline ? (
    <div className="offline-banner" role="status">
      오프라인이에요. 연결되면 새로운 경험을 불러올 수 있어요.
    </div>
  ) : null;
}
