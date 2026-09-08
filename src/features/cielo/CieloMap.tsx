import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFlights } from './useFlights';
import { formatAlt, formatVel, headingToCompass } from './opensky';
import { CieloFallback } from './CieloFallback';

function planeIcon(heading: number | null): L.DivIcon {
  const rot = typeof heading === 'number' && !Number.isNaN(heading) ? heading : 0;
  return L.divIcon({
    className: 'cielo-plane-icon',
    html: `<div style="transform: rotate(${rot}deg); font-size: 22px; line-height: 1; color: #1d4ed8; text-shadow: 0 0 3px #fff;" aria-hidden="true">▲</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
}

export function CieloMap() {
  const divRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { flights, error, lastUpdate, retry } = useFlights();
  const [minAlt, setMinAlt] = useState(0);
  const [onlyWithCallsign, setOnlyWithCallsign] = useState(false);

  const filtered = useMemo(
    () =>
      flights.filter((f) => {
        if (onlyWithCallsign && !f.callsign) return false;
        if ((f.alt ?? 0) < minAlt) return false;
        return true;
      }),
    [flights, minAlt, onlyWithCallsign],
  );

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    mapRef.current = L.map(divRef.current).setView([42.5, 12.5], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const layer = L.layerGroup().addTo(mapRef.current);
    filtered.forEach((f) => {
      const compass = headingToCompass(f.heading);
      const headingTxt = f.heading == null ? '?' : `${Math.round(f.heading)}° (${compass})`;
      L.marker([f.lat, f.lon], { icon: planeIcon(f.heading) })
        .bindPopup(
          `<strong>${f.callsign || f.icao24}</strong><br/>` +
            `ICAO24: ${f.icao24}<br/>` +
            `Alt: ${formatAlt(f.alt)}<br/>` +
            `Vel: ${formatVel(f.vel)}<br/>` +
            `Heading: ${headingTxt}`,
        )
        .addTo(layer);
    });
    return () => {
      layer.remove();
    };
  }, [filtered]);

  function goFullscreen() {
    wrapRef.current?.requestFullscreen?.().catch?.(() => {});
  }

  if (error && flights.length === 0)
    return <CieloFallback error={error} onRetry={() => retry()} />;

  return (
    <div ref={wrapRef} style={{ background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <label style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
          Altitudine minima: {minAlt} m
          <input
            type="range"
            min={0}
            max={12000}
            step={500}
            value={minAlt}
            onChange={(e) => setMinAlt(Number(e.target.value))}
            style={{ minHeight: 44, minWidth: 160 }}
            aria-label="Altitudine minima"
          />
        </label>
        <label style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
          <input
            type="checkbox"
            checked={onlyWithCallsign}
            onChange={(e) => setOnlyWithCallsign(e.target.checked)}
            style={{ width: 24, height: 24 }}
          />
          Solo con callsign
        </label>
        <button
          type="button"
          onClick={goFullscreen}
          style={{ fontSize: 16, minHeight: 44, padding: '8px 16px', cursor: 'pointer' }}
        >
          ⛶ Fullscreen
        </button>
        <button
          type="button"
          onClick={() => retry()}
          style={{ fontSize: 16, minHeight: 44, padding: '8px 16px', cursor: 'pointer' }}
        >
          ↻ Aggiorna
        </button>
      </div>
      <div ref={divRef} style={{ height: '70vh', minHeight: 320, borderRadius: 16 }} />
      <p style={{ fontSize: 16 }}>
        Aerei visibili: {filtered.length} / {flights.length} - aggiorna ogni 12s
        {lastUpdate ? ` - ultimo aggiornamento ${new Date(lastUpdate).toLocaleTimeString()}` : ''}
      </p>
      {error ? <p style={{ fontSize: 14 }}>Ultimo errore: {error} (mostro ultimi dati)</p> : null}
      <p style={{ fontSize: 14 }}>Legenda: ▲ = aereo orientato per heading (0° = N, 90° = E, 180° = S, 270° = W).</p>
    </div>
  );
}
