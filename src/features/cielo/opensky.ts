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
