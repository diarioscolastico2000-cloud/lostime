import { describe, it, expect } from 'vitest';
import { mapStatesToFlights } from '../../src/features/cielo/opensky';

describe('opensky', () => {
  it('mappa stati in voli', () => {
    // OpenSky states: [icao24, callsign, origin, timePos, lastContact, lon, lat, ...]
    // s[5]=lon=9.2 s[6]=lat=45.5 (nel piano i due valori erano invertiti nel record).
    const flights = mapStatesToFlights([
      ['abc123', 'RYR123 ', 'Italy', 1, 2, 9.2, 45.5, 10000, false, 250, 90, null, null, null, null, false, 0],
    ]);
    expect(flights[0]).toMatchObject({ icao24: 'abc123', lat: 45.5, lon: 9.2 });
  });
  it('scarta record senza posizione', () => {
    const flights = mapStatesToFlights([
      ['x', null, null, 1, 2, null, null, null, false, null, null, null, null, null, null, false, 0],
    ]);
    expect(flights).toHaveLength(0);
  });
});
