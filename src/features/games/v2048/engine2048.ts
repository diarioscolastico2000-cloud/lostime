/** Engine 2048 puro: nessuna dipendenza da React/DOM. Funzioni pure testabili. */

export const SIZE = 4;
export const TARGET = 2048;

export type Grid = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export type MoveResult = {
  grid: Grid;
  /** Somma dei valori generati dalle fusioni di questa mossa. */
  gained: number;
  /** False se la mossa non cambia la griglia (nessuno spawn in quel caso). */
  moved: boolean;
};

export function emptyGrid(size: number = SIZE): Grid {
  return Array.from({ length: size }, () => Array<number>(size).fill(0));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, r) => row.length === b[r].length && row.every((v, c) => v === b[r][c]));
}

export function emptyCells(grid: Grid): Array<{ r: number; c: number }> {
  const out: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 0) out.push({ r, c });
    }
  }
  return out;
}

/** Compatta una riga verso sinistra fondendo coppie uguali (una fusione per cella). */
function slideRowLeft(row: number[]): { row: number[]; gained: number; moved: boolean } {
  const tiles = row.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const v = tiles[i] * 2;
      out.push(v);
      gained += v;
      i++; // la cella appena fusa non si fonde di nuovo in questa mossa
    } else {
      out.push(tiles[i]);
    }
  }
  while (out.length < row.length) out.push(0);
  return { row: out, gained, moved: !row.every((v, i) => v === out[i]) };
}

function transpose(grid: Grid): Grid {
  return grid[0].map((_, c) => grid.map((row) => row[c]));
}

function reverseRows(grid: Grid): Grid {
  return grid.map((row) => [...row].reverse());
}

export function move(grid: Grid, dir: Direction): MoveResult {
  // Ri-orienta la griglia così da riusare sempre slideRowLeft.
  let work = dir === 'left' || dir === 'right' ? cloneGrid(grid) : transpose(grid);
  if (dir === 'right' || dir === 'down') work = reverseRows(work);

  let gained = 0;
  let moved = false;
  const slid = work.map((row) => {
    const s = slideRowLeft(row);
    gained += s.gained;
    if (s.moved) moved = true;
    return s.row;
  });

  let out = slid;
  if (dir === 'right' || dir === 'down') out = reverseRows(out);
  if (dir === 'up' || dir === 'down') out = transpose(out);

  return { grid: out, gained, moved };
}

/**
 * Aggiunge una tessera (90% "2", 10% "4") in una cella vuota casuale.
 * Restituisce una NUOVA griglia; se piena, restituisce una copia invariata.
 * `rand` è iniettabile per test deterministici.
 */
export function spawnRandom(grid: Grid, rand: () => number = Math.random): Grid {
  const next = cloneGrid(grid);
  const cells = emptyCells(next);
  if (cells.length === 0) return next;
  const pick = cells[Math.floor(rand() * cells.length) % cells.length];
  next[pick.r][pick.c] = rand() < 0.9 ? 2 : 4;
  return next;
}

/** Griglia iniziale: vuota + 2 spawn. */
export function initialGrid(rand: () => number = Math.random): Grid {
  return spawnRandom(spawnRandom(emptyGrid(), rand), rand);
}

/** True se esiste almeno una mossa legale (cella vuota o fusione possibile). */
export function canMove(grid: Grid): boolean {
  if (emptyCells(grid).length > 0) return true;
  const n = grid.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const v = grid[r][c];
      if (c + 1 < grid[r].length && grid[r][c + 1] === v) return true;
      if (r + 1 < n && grid[r + 1] && grid[r + 1][c] === v) return true;
    }
  }
  return false;
}

/** True se non resta alcuna mossa legale. */
export function isOver(grid: Grid): boolean {
  return !canMove(grid);
}

/** True se una tessera raggiunge (o supera) il target, default 2048. */
export function isWon(grid: Grid, target: number = TARGET): boolean {
  return grid.some((row) => row.some((v) => v >= target));
}

/** Somma delle tessere in griglia (utile per debug/statistiche). */
export function score(grid: Grid): number {
  return grid.reduce((acc, row) => acc + row.reduce((a, v) => a + v, 0), 0);
}

/** Valore massimo in griglia. */
export function maxTile(grid: Grid): number {
  return grid.reduce((m, row) => row.reduce((a, v) => Math.max(a, v), m), 0);
}
