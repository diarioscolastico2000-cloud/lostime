import { describe, it, expect } from 'vitest';
import { formatAlt, formatVel, headingToCompass, mapStatesToFlights } from '../../src/features/cielo/opensky';

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
  it('formatAlt converte m in ft + FL', () => {
    expect(formatAlt(null)).toBe('?');
    const s = formatAlt(10000);
    expect(s).toContain('10000 m');
    expect(s).toContain('32808 ft');
    expect(s).toContain('FL328');
  });
  it('formatVel converte m/s in kmh + nodi', () => {
    expect(formatVel(null)).toBe('?');
    const s = formatVel(250);
    expect(s).toContain('250 m/s');
    expect(s).toContain('900 km/h');
    expect(s).toContain('486 kt');
  });
  it('headingToCompass copre punti cardinali', () => {
    expect(headingToCompass(null)).toBe('?');
    expect(headingToCompass(0)).toBe('N');
    expect(headingToCompass(90)).toBe('E');
    expect(headingToCompass(180)).toBe('S');
    expect(headingToCompass(270)).toBe('W');
    expect(headingToCompass(45)).toBe('NE');
    expect(headingToCompass(360)).toBe('N');
  });
});
