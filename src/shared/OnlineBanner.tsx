import { useEffect, useState } from 'react';

/** Banner offline discreto: una riga sottile, solo quando serve. */
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
    <div className="lt-offline" role="alert">
      📡 Sei offline — riconnessione in corso, le mosse sono in pausa.
    </div>
  );
}
