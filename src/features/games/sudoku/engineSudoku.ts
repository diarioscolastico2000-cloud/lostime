/** Motore Sudoku puro: generazione con soluzione unica, validazione, hint. Nessuna dipendenza. */

export type Grid = number[][]; // 9x9, 0 = vuota
export type Livello = 'facile' | 'medio' | 'difficile';

export const BUCHI_PER_LIVELLO: Record<Livello, number> = {
  facile: 40,
  medio: 50,
  difficile: 55,
};

export type Hint = { r: number; c: number; valore: number } | null;

function shuffled<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function cloneGrid(g: Grid): Grid {
  return g.map((r) => [...r]);
}

function boxStart(i: number): number {
  return Math.floor(i / 3) * 3;
}

/** Valore v piazzabile in (r,c)? Ignora il contenuto della cella stessa. */
export function isValidMove(grid: Grid, r: number, c: number, v: number): boolean {
  if (r < 0 || r > 8 || c < 0 || c > 8) return false;
  if (!Number.isInteger(v) || v < 1 || v > 9) return false;
  for (let k = 0; k < 9; k++) {
    if (k !== c && grid[r][k] === v) return false;
    if (k !== r && grid[k][c] === v) return false;
  }
  const br = boxStart(r);
  const bc = boxStart(c);
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const rr = br + dr;
      const cc = bc + dc;
      if (rr === r && cc === c) continue;
      if (grid[rr][cc] === v) return false;
    }
  }
  return true;
}

function candidati(grid: Grid, r: number, c: number): number[] {
  const out: number[] = [];
  for (let v = 1; v <= 9; v++) if (isValidMove(grid, r, c, v)) out.push(v);
  return out;
}

function cellaVuotaMigliore(grid: Grid): [number, number] | null {
  let best: [number, number] | null = null;
  let bestN = 10;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      const n = candidati(grid, r, c).length;
      if (n === 0) return [r, c]; // vicolo cieco: fallisci subito
      if (n < bestN) {
        bestN = n;
        best = [r, c];
        if (n === 1) return best;
      }
    }
  }
  return best;
}

function riempi(grid: Grid, rand: () => number = Math.random): boolean {
  const pos = cellaVuotaMigliore(grid);
  if (!pos) return true;
  const [r, c] = pos;
  for (const v of shuffled(candidati(grid, r, c), rand)) {
    grid[r][c] = v;
    if (riempi(grid, rand)) return true;
    grid[r][c] = 0;
  }
  return false;
}

/** Griglia completa valida generata via backtracking. */
export function generaSoluzione(rand: () => number = Math.random): Grid {
  const g = emptyGrid();
  riempi(g, rand);
  return g;
}

/** Conta le soluzioni fino a `cap` (default 2): serve per garantire unicità. */
export function contaSoluzioni(grid: Grid, cap = 2): number {
  let count = 0;
  const g = cloneGrid(grid);
  function bt(): void {
    if (count >= cap) return;
    const pos = cellaVuotaMigliore(g);
    if (!pos) {
      count++;
      return;
    }
    const [r, c] = pos;
    for (const v of candidati(g, r, c)) {
      g[r][c] = v;
      bt();
      g[r][c] = 0;
      if (count >= cap) return;
    }
  }
  bt();
  return count;
}

export function haSoluzioneUnica(grid: Grid): boolean {
  return contaSoluzioni(grid, 2) === 1;
}

/** Griglia completa valida? (niente zeri + ogni riga/colonna/blocco contiene 1-9) */
export function isComplete(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v < 1 || v > 9) return false;
    }
  }
  return isValidSolution(grid);
}

export function isValidSolution(grid: Grid): boolean {
  const ok = (vals: number[]) => {
    const s = new Set(vals);
    return s.size === 9 && [...s].every((v) => v >= 1 && v <= 9);
  };
  for (let i = 0; i < 9; i++) {
    const riga = grid[i];
    const col = grid.map((r) => r[i]);
    if (!ok(riga) || !ok(col)) return false;
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const vals: number[] = [];
      for (let dr = 0; dr < 3; dr++)
        for (let dc = 0; dc < 3; dc++) vals.push(grid[br * 3 + dr][bc * 3 + dc]);
      if (!ok(vals)) return false;
    }
  }
  return true;
}

export type Puzzle = { puzzle: Grid; soluzione: Grid; livello: Livello; buchi: number };

/**
 * Genera un puzzle con soluzione unica via rimozione simmetrica.
 * Facile 40 buchi, medio 50, difficile 55.
 */
export function generaPuzzle(
  livello: Livello = 'facile',
  rand: () => number = Math.random,
): Puzzle {
  const soluzione = generaSoluzione(rand);
  const puzzle = cloneGrid(soluzione);
  const target = BUCHI_PER_LIVELLO[livello];

  // Coppie simmetriche (centro (4,4) da solo) in ordine casuale
  const coppie: Array<[[number, number], [number, number] | null]> = [];
  const viste = new Set<string>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const mr = 8 - r;
      const mc = 8 - c;
      const k1 = `${r},${c}`;
      const k2 = `${mr},${mc}`;
      if (viste.has(k1) || viste.has(k2)) continue;
      viste.add(k1);
      viste.add(k2);
      if (r === mr && c === mc) coppie.push([[r, c], null]);
      else coppie.push([
        [r, c],
        [mr, mc],
      ]);
    }
  }
  const ordine = shuffled(coppie, rand);
  let buchi = 0;

  for (const [a, b] of ordine) {
    if (buchi >= target) break;
    const bakA = puzzle[a[0]][a[1]];
    const bakB = b ? puzzle[b[0]][b[1]] : null;
    if (bakA === 0 && (b == null || bakB === 0)) continue;
    puzzle[a[0]][a[1]] = 0;
    if (b) puzzle[b[0]][b[1]] = 0;
    if (haSoluzioneUnica(puzzle)) {
      buchi += b ? 2 : 1;
    } else {
      puzzle[a[0]][a[1]] = bakA;
      if (b && bakB != null) puzzle[b[0]][b[1]] = bakB;
    }
  }

  // Se la simmetria non basta (griglie dure), completa con singole casuali
  if (buchi < target) {
    const singole = shuffled(
      Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]) as Array<[number, number]>,
      rand,
    );
    for (const [r, c] of singole) {
      if (buchi >= target) break;
      if (puzzle[r][c] === 0) continue;
      const bak = puzzle[r][c];
      puzzle[r][c] = 0;
      if (haSoluzioneUnica(puzzle)) buchi++;
      else puzzle[r][c] = bak;
    }
  }

  return { puzzle, soluzione, livello, buchi };
}

/** Suggerimento: prima cella vuota/errata (casuale) con valore corretto, oppure null se completo. */
export function hint(
  corrente: Grid,
  soluzione: Grid,
  rand: () => number = Math.random,
): Hint {
  const cand: Array<[number, number]> = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (corrente[r][c] !== soluzione[r][c]) cand.push([r, c]);
    }
  }
  if (cand.length === 0) return null;
  const [r, c] = cand[Math.floor(rand() * cand.length)];
  return { r, c, valore: soluzione[r][c] };
}

export function contaBuchi(grid: Grid): number {
  return grid.flat().filter((v) => v === 0).length;
}
