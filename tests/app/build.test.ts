import { describe, it, expect } from 'vitest';
import { GAMES } from '../../src/features/games/registry';
describe('build finale', () => {
  it('registry ha 5 giochi (MVP + 2048)', () => {
    expect(Object.keys(GAMES).sort()).toEqual(['quiz', 'scacchi', 'solitario', 'tris', 'v2048']);
  });
});
