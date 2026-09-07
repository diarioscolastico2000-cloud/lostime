import { useEffect, useState } from 'react';
import { fetchFlights, Flight, ITALY_BBOX, BBox } from './opensky';

export function useFlights(bbox: BBox = ITALY_BBOX) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    let timer: any;
    async function tick() {
      try {
        const f = await fetchFlights(bbox);
        if (alive) {
          setFlights(f);
          setError(null);
        }
      } catch (e: any) {
        if (alive) setError(e.message);
      }
      timer = setTimeout(tick, 12000);
    }
    tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bbox.lamin, bbox.lomin, bbox.lamax, bbox.lomax]);
  return { flights, error };
}
