import { describe, it, expect } from 'vitest';
import {
  contaSoluzioni,
  generaPuzzle,
  generaSoluzione,
  hint,
  isComplete,
  isValidMove,
  isValidSolution,
  type Grid,
} from '../../src/features/games/sudoku/engineSudoku';

describe('sudoku engine', () => {
  it('soluzione generata: griglia 9x9 completa e valida', () => {
    const s = generaSoluzione();
    expect(s).toHaveLength(9);
    for (const r of s) expect(r).toHaveLength(9);
    expect(s.flat().every((v) => v >= 1 && v <= 9)).toBe(true);
    expect(isValidSolution(s)).toBe(true);
    expect(isComplete(s)).toBe(true);
  });

  it('puzzle generato: soluzione valida + unica, buchi nel range atteso', () => {
    for (const livello of ['facile', 'medio', 'difficile'] as const) {
      const { puzzle, soluzione, buchi } = generaPuzzle(livello);
      // la soluzione è valida e completa
      expect(isValidSolution(soluzione)).toBe(true);
      // il puzzle rispetta la soluzione ovunque è riempito
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (puzzle[r][c] !== 0) expect(puzzle[r][c]).toBe(soluzione[r][c]);
        }
      }
      // soluzione unica
      expect(contaSoluzioni(puzzle, 2)).toBe(1);
      // buchi: tolleranza (la simmetria può fermarsi a ±2 dal target)
      const attesi = { facile: 40, medio: 50, difficile: 55 }[livello];
      expect(buchi).toBeGreaterThanOrEqual(attesi - 3);
      expect(buchi).toBeLessThanOrEqual(attesi + 1);
    }
  }, 30000);

  it('mossa invalida rifiutata (riga/colonna/blocco/fuori range)', () => {
    const g: Grid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];
    // 5 già in riga 0
    expect(isValidMove(g, 0, 2, 5)).toBe(false);
    // 6 già in colonna 0
    expect(isValidMove(g, 2, 0, 6)).toBe(false);
    // 9 già nel blocco alto-sx
    expect(isValidMove(g, 0, 2, 9)).toBe(false);
    // fuori range
    expect(isValidMove(g, 0, 2, 0)).toBe(false);
    expect(isValidMove(g, 0, 2, 10)).toBe(false);
    // mossa lecita
    expect(isValidMove(g, 0, 2, 1)).toBe(true);
  });

  it('griglia completa riconosciuta, incompleta/errata no', () => {
    const s = generaSoluzione();
    expect(isComplete(s)).toBe(true);
    const vuota = s.map((r) => [...r]);
    vuota[0][0] = 0;
    expect(isComplete(vuota)).toBe(false);
    const errata = s.map((r) => [...r]);
    errata[0][0] = errata[0][1]; // duplicato in riga
    expect(isComplete(errata)).toBe(false);
    expect(isValidSolution(errata)).toBe(false);
  });

  it('hint restituisce una cella da riempire, null a puzzle completo', () => {
    const s = generaSoluzione();
    expect(hint(s, s)).toBeNull();
    const cur = s.map((r) => [...r]);
    cur[4][4] = 0;
    cur[0][0] = cur[0][0] === 9 ? 1 : 9; // valore errato
    const h = hint(cur, s);
    expect(h).not.toBeNull();
    expect(s[h!.r][h!.c]).toBe(h!.valore);
    expect(cur[h!.r][h!.c]).not.toBe(h!.valore);
  });
});
