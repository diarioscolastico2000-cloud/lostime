import { describe, it, expect } from 'vitest';
import { createDeck, canDropOnFoundation, dealGame, drawFromStock, isVictory } from '../../src/features/games/solitaire/solitaireEngine';
describe('solitario', () => {
  it('mazzo da 52 carte uniche', () => {
    const d = createDeck();
    expect(d).toHaveLength(52);
    expect(new Set(d.map(c => c.seme + c.valore)).size).toBe(52);
  });
  it('asso va su fondazione vuota', () => {
    expect(canDropOnFoundation(null, { seme: 'cuori', valore: 1, coperta: false })).toBe(true);
  });
  it('deal distribuisce 28 carte in tableau 1..7 con ultima scoperta', () => {
    const g = dealGame();
    expect(g.tableau).toHaveLength(7);
    g.tableau.forEach((col, i) => expect(col).toHaveLength(i + 1));
    const inTableau = g.tableau.flat().length;
    expect(inTableau).toBe(28);
    for (const col of g.tableau) {
      expect(col[col.length - 1].coperta).toBe(false);
      col.slice(0, -1).forEach((c) => expect(c.coperta).toBe(true));
    }
    expect(g.stock).toHaveLength(24);
    expect(g.waste).toHaveLength(0);
    expect(g.foundations.flat()).toHaveLength(0);
  });
  it('pesca sposta stock->waste scoperta', () => {
    const g = dealGame();
    const n = drawFromStock(g);
    expect(n.stock).toHaveLength(23);
    expect(n.waste).toHaveLength(1);
    expect(n.waste[0].coperta).toBe(false);
    expect(n.moves).toBe(g.moves + 1);
    // purezza: lo stato originale non muta
    expect(g.stock).toHaveLength(24);
    expect(g.waste).toHaveLength(0);
  });
  it('stock esaurito ricicla il waste', () => {
    let g = dealGame();
    for (let i = 0; i < 24; i++) g = drawFromStock(g);
    expect(g.stock).toHaveLength(0);
    expect(g.waste).toHaveLength(24);
    const r = drawFromStock(g);
    expect(r.waste).toHaveLength(0);
    expect(r.stock).toHaveLength(24);
    expect(r.stock.every((c) => c.coperta)).toBe(true);
  });
  it('vittoria rilevata con 52 carte in fondazione', () => {
    const g = dealGame();
    expect(isVictory(g)).toBe(false);
    const semi = ['cuori', 'quadri', 'fiori', 'picche'] as const;
    const won = {
      ...g,
      tableau: [[], [], [], [], [], [], []],
      stock: [],
      waste: [],
      foundations: semi.map((seme) =>
        Array.from({ length: 13 }, (_, i) => ({ seme, valore: i + 1, coperta: false, id: `${seme}-${i + 1}` })),
      ),
    };
    expect(isVictory(won)).toBe(true);
  });
});
