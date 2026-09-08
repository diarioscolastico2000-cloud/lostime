import { describe, it, expect } from 'vitest';
import {
  emptyGrid,
  initialGrid,
  isOver,
  isWon,
  move,
  spawnRandom,
} from '../../src/features/games/v2048/engine2048';

describe('2048 engine', () => {
  it('spawn iniziale: 2 celle valorizzate (2 o 4)', () => {
    const g = initialGrid(() => 0);
    const vals = g.flat().filter((v) => v !== 0);
    expect(vals).toHaveLength(2);
    for (const v of vals) expect([2, 4]).toContain(v);
  });

  it('spawnRandom aggiunge esattamente una tessera', () => {
    const g = emptyGrid();
    const next = spawnRandom(g, () => 0);
    expect(next.flat().filter((v) => v !== 0)).toHaveLength(1);
    // l'originale non è mutato (purezza)
    expect(g.flat().every((v) => v === 0)).toBe(true);
  });

  it('move sinistra unisce le coppie (una fusione per cella)', () => {
    const g = [
      [2, 2, 0, 0],
      [4, 0, 4, 0],
      [2, 2, 2, 0],
      [2, 4, 8, 16],
    ];
    const r = move(g, 'left');
    expect(r.moved).toBe(true);
    expect(r.grid[0]).toEqual([4, 0, 0, 0]);
    expect(r.grid[1]).toEqual([8, 0, 0, 0]);
    // [2,2,2] -> [4,2]: niente doppia fusione
    expect(r.grid[2]).toEqual([4, 2, 0, 0]);
    // riga già compatta: invariata
    expect(r.grid[3]).toEqual([2, 4, 8, 16]);
    expect(r.gained).toBe(4 + 8 + 4);
  });

  it('move che non cambia nulla: moved=false, gained=0', () => {
    const g = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const r = move(g, 'left');
    expect(r.moved).toBe(false);
    expect(r.gained).toBe(0);
  });

  it('move verso alto unisce la colonna', () => {
    const g = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const r = move(g, 'up');
    expect(r.moved).toBe(true);
    expect(r.grid[0][0]).toBe(4);
    expect(r.grid[1][0]).toBe(0);
    expect(r.gained).toBe(4);
  });

  it('game over rilevato', () => {
    const piena = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(isOver(piena)).toBe(true);

    const conVuoto = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 0, 4],
      [4, 2, 4, 2],
    ];
    expect(isOver(conVuoto)).toBe(false);

    // Piena ma con fusione possibile -> non finita
    const fondibile = [
      [2, 2, 4, 8],
      [16, 32, 64, 128],
      [256, 512, 1024, 2048],
      [4096, 8192, 16384, 32768],
    ];
    expect(isOver(fondibile)).toBe(false);
  });

  it('vittoria a 2048', () => {
    const vincente = [
      [2048, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(isWon(vincente)).toBe(true);
    expect(isWon(emptyGrid())).toBe(false);
    expect(isWon([[1024, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])).toBe(false);
  });

  it('fusione 1024+1024 crea 2048 e fa vincere', () => {
    const g = [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const r = move(g, 'left');
    expect(r.grid[0]).toEqual([2048, 0, 0, 0]);
    expect(r.gained).toBe(2048);
    expect(isWon(r.grid)).toBe(true);
  });
});
