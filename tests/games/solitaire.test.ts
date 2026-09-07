import { describe, it, expect } from 'vitest';
import { createDeck, canDropOnFoundation } from '../../src/features/games/solitaire/solitaireEngine';
describe('solitario', () => {
  it('mazzo da 52 carte uniche', () => {
    const d = createDeck();
    expect(d).toHaveLength(52);
    expect(new Set(d.map(c => c.seme + c.valore)).size).toBe(52);
  });
  it('asso va su fondazione vuota', () => {
    expect(canDropOnFoundation(null, { seme: 'cuori', valore: 1, coperta: false })).toBe(true);
  });
});
