export type BBox = { lamin: number; lomin: number; lamax: number; lomax: number };
export type Flight = {
  icao24: string;
  callsign: string;
  lat: number;
  lon: number;
  alt: number | null;
  vel: number | null;
  heading: number | null;
};

export function mapStatesToFlights(states: any[][] | null): Flight[] {
  if (!states) return [];
  const out: Flight[] = [];
  for (const s of states) {
    const [icao24, callsign, , , , lon, lat, alt, , vel, heading] = s;
    if (typeof lat !== 'number' || typeof lon !== 'number') continue;
    out.push({
      icao24: String(icao24),
      callsign: String(callsign ?? '').trim(),
      lat,
      lon,
      alt: alt ?? null,
      vel: vel ?? null,
      heading: heading ?? null,
    });
    if (out.length >= 400) break;
  }
  return out;
}

export async function fetchFlights(bbox: BBox): Promise<Flight[]> {
  const p = new URLSearchParams({
    lamin: String(bbox.lamin),
    lomin: String(bbox.lomin),
    lamax: String(bbox.lamax),
    lomax: String(bbox.lomax),
  });
  const res = await fetch(`https://opensky-network.org/api/states/all?${p.toString()}`);
  if (!res.ok) throw new Error('OPENSKY_' + res.status);
  const json = await res.json();
  return mapStatesToFlights(json.states ?? null);
}

export const ITALY_BBOX: BBox = { lamin: 35, lomin: 6, lamax: 47.5, lomax: 19 };

/** Altitudine m -> stringa con piedi + flight level. Null -> "?". */
export function formatAlt(m: number | null | undefined): string {
  if (m == null || typeof m !== 'number' || Number.isNaN(m)) return '?';
  const ft = Math.round(m * 3.28084);
  const fl = Math.round(ft / 100);
  return `${m} m (${ft} ft / FL${fl})`;
}

/** Velocità m/s -> stringa con km/h + nodi. Null -> "?". */
export function formatVel(ms: number | null | undefined): string {
  if (ms == null || typeof ms !== 'number' || Number.isNaN(ms)) return '?';
  const kmh = Math.round(ms * 3.6);
  const kt = Math.round(ms * 1.94384);
  return `${ms} m/s (${kmh} km/h / ${kt} kt)`;
}

const COMPASS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** Heading gradi 0-360 -> punto bussola a 16 venti. Null -> "?". */
export function headingToCompass(h: number | null | undefined): string {
  if (h == null || typeof h !== 'number' || Number.isNaN(h)) return '?';
  const norm = ((h % 360) + 360) % 360;
  const idx = Math.round(norm / 22.5) % 16;
  return COMPASS_16[idx];
}
