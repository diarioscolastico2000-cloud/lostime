import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFlights } from './useFlights';
import { CieloFallback } from './CieloFallback';

export function CieloMap() {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { flights, error } = useFlights();

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
    flights.forEach((f) => {
      L.marker([f.lat, f.lon])
        .bindPopup(`${f.callsign || f.icao24}<br/>Alt ${f.alt ?? '?'}m Vel ${f.vel ?? '?'}m/s`)
        .addTo(layer);
    });
    return () => {
      layer.remove();
    };
  }, [flights]);

  if (error && flights.length === 0)
    return <CieloFallback error={error} onRetry={() => location.reload()} />;

  return (
    <div>
      <div ref={divRef} style={{ height: 480, borderRadius: 16 }} />
      <p>Aerei visibili: {flights.length} - aggiorna ogni 12s</p>
    </div>
  );
}
