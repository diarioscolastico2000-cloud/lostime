import { describe, it, expect } from 'vitest';
import { GAMES } from '../../src/features/games/registry';
describe('build finale', () => {
  it('registry ha 4 giochi MVP', () => {
    expect(Object.keys(GAMES).sort()).toEqual(['quiz', 'scacchi', 'solitario', 'tris']);
  });
});
