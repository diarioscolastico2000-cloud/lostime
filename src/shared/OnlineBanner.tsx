import { useEffect, useState } from 'react';

/** Banner offline: mosse in pausa fino a riconnessione (spec error handling). */
export function OnlineBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;
  return (
    <div
      role="alert"
      style={{ background: '#c62828', color: '#fff', padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}
    >
      📡 Sei offline — riconnessione in corso, le mosse sono in pausa.
    </div>
  );
}
