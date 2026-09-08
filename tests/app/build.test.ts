import { describe, it, expect } from 'vitest';
import { GAMES } from '../../src/features/games/registry';
describe('build finale', () => {
  it('registry ha 9 giochi (MVP + 2048 + minato + sudoku + wordle + forza4)', () => {
    expect(Object.keys(GAMES).sort()).toEqual(['forza4', 'minato', 'quiz', 'scacchi', 'solitario', 'sudoku', 'tris', 'v2048', 'wordle']);
  });
});
