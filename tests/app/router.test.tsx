import { describe, it, expect } from 'vitest';
import { getAppRoutes } from '../../src/app/router';
describe('router', () => {
  it('espone tutte le rotte MVP predisposte', () => {
    expect(getAppRoutes()).toEqual(
      expect.arrayContaining(['/', '/curiosita', '/cielo', '/giochi', '/r/:codice'])
    );
  });
});
