import { describe, it, expect } from 'vitest';
import {
  countAperte,
  countMine,
  createBoard,
  isLost,
  isWon,
  openCell,
  toggleFlag,
  type Board,
} from '../../src/features/games/mines/engineMines';

function zeroRand(): number {
  return 0;
}

describe('mines engine', () => {
  it('board con esattamente N mine', () => {
    const b = createBoard(9, 9, 10, undefined, zeroRand);
    expect(b).toHaveLength(9);
    expect(b[0]).toHaveLength(9);
    expect(countMine(b)).toBe(10);
  });

  it('prima apertura sempre sicura: safeFirst mai mina', () => {
    for (let i = 0; i < 20; i++) {
      const b = createBoard(9, 9, 10, { r: 4, c: 4 }, zeroRand);
      expect(b[4][4].mina).toBe(false);
      const opened = openCell(b, 4, 4);
      expect(opened[4][4].aperta).toBe(true);
      expect(isLost(opened)).toBe(false);
    }
  });

  it('flood fill: aprire uno zero apre la zona connessa', () => {
    // Board 5x5 senza mine tranne una in un angolo: aprire l'angolo opposto apre quasi tutto.
    const b = createBoard(5, 5, 0);
    // Piazzo manualmente una mina lontano dalla zona di apertura.
    const manual: Board = b.map((row) => row.map((cell) => ({ ...cell })));
    manual[0][0].mina = true;
    // Ricalcolo adiacenti aprendo via engine: riuso createBoard con safe per coerenza,
    // poi forzo la mina e verifico il flood su una board costruita ad hoc.
    const safe = createBoard(5, 5, 1, { r: 4, c: 4 }, zeroRand);
    expect(countMine(safe)).toBe(1);
    expect(safe[4][4].mina).toBe(false);
    const opened = openCell(safe, 4, 4);
    expect(isLost(opened)).toBe(false);
    // Lo zero in (4,4) deve aver propagato: molte celle aperte, non solo una.
    expect(countAperte(opened)).toBeGreaterThan(1);
    expect(opened[4][4].aperta).toBe(true);
    // La mina resta coperta dopo il flood.
    for (const row of opened) for (const cell of row) if (cell.mina) expect(cell.aperta).toBe(false);
    expect(manual[0][0].mina).toBe(true);
  });

  it('aprire una cella numerata apre solo quella', () => {
    // Tutte mine tranne una cella: impossibile avere zeri, ogni apertura è singola.
    const b = createBoard(3, 3, 0);
    expect(countAperte(openCell(b, 1, 1))).toBe(9); // sanity: board vuota apre tutto
    const full: Board = Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => ({
        mina: !(r === 1 && c === 1),
        aperta: false,
        bandiera: false,
        adiacenti: r === 1 && c === 1 ? 8 : 0,
      })),
    );
    const opened = openCell(full, 1, 1);
    expect(opened[1][1].aperta).toBe(true);
    expect(countAperte(opened)).toBe(1);
  });

  it('bandiera non apribile: openCell su cella bandierata non apre', () => {
    const b = createBoard(5, 5, 5, undefined, zeroRand);
    const flagged = toggleFlag(b, 2, 2);
    expect(flagged[2][2].bandiera).toBe(true);
    const after = openCell(flagged, 2, 2);
    expect(after[2][2].aperta).toBe(false);
    expect(after[2][2].bandiera).toBe(true);
    // Rimuovo la bandiera: ora si apre.
    const unflagged = toggleFlag(after, 2, 2);
    expect(unflagged[2][2].bandiera).toBe(false);
  });

  it('toggleFlag non tocca le celle aperte', () => {
    const b = createBoard(5, 5, 0);
    const opened = openCell(b, 2, 2);
    expect(opened[2][2].aperta).toBe(true);
    const flagged = toggleFlag(opened, 2, 2);
    expect(flagged[2][2].bandiera).toBe(false);
  });

  it('sconfitta rilevata aprendo una mina', () => {
    const b = createBoard(3, 3, 8, undefined, zeroRand);
    expect(countMine(b)).toBe(8);
    expect(isLost(b)).toBe(false);
    // Trovo una mina e la apro.
    let minePos = { r: 0, c: 0 };
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (b[r][c].mina) minePos = { r, c };
    const after = openCell(b, minePos.r, minePos.c);
    expect(isLost(after)).toBe(true);
    expect(isWon(after)).toBe(false);
  });

  it('vittoria rilevata aprendo tutte le sicure', () => {
    const b = createBoard(3, 3, 1, { r: 2, c: 2 }, zeroRand);
    let cur = b;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (!cur[r][c].mina) cur = openCell(cur, r, c);
      }
    }
    expect(isLost(cur)).toBe(false);
    expect(isWon(cur)).toBe(true);
  });

  it('purezza: openCell e toggleFlag non mutano l’originale', () => {
    const b = createBoard(4, 4, 3, undefined, zeroRand);
    const snapshot = JSON.stringify(b);
    openCell(b, 0, 0);
    toggleFlag(b, 1, 1);
    expect(JSON.stringify(b)).toBe(snapshot);
  });
});
