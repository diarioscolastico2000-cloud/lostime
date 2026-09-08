import { describe, it, expect } from 'vitest';
import { GAMES } from '../../src/features/games/registry';
describe('build finale', () => {
  it('registry ha 7 giochi (MVP + 2048 + minato + sudoku)', () => {
    expect(Object.keys(GAMES).sort()).toEqual(['minato', 'quiz', 'scacchi', 'solitario', 'sudoku', 'tris', 'v2048']);
  });
});
