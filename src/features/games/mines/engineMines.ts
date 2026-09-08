/** Engine Campo Minato puro: nessuna dipendenza da React/DOM. Funzioni pure testabili. */

export type Cell = {
  mina: boolean;
  aperta: boolean;
  bandiera: boolean;
  /** Mine adiacenti (0-8). Ricalcolato da createBoard. */
  adiacenti: number;
};

export type Board = Cell[][];

export type Pos = { r: number; c: number };

export function inBounds(board: Board, r: number, c: number): boolean {
  return r >= 0 && c >= 0 && r < board.length && c < (board[r] ? board[r].length : 0);
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function emptyBoard(righe: number, cols: number): Board {
  return Array.from({ length: righe }, () =>
    Array.from({ length: cols }, (): Cell => ({ mina: false, aperta: false, bandiera: false, adiacenti: 0 })),
  );
}

function neighborsOf(righe: number, cols: number, r: number, c: number): Pos[] {
  const out: Pos[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < righe && nc < cols) out.push({ r: nr, c: nc });
    }
  }
  return out;
}

function computeAdiacenti(board: Board): void {
  const righe = board.length;
  for (let r = 0; r < righe; r++) {
    const cols = board[r].length;
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mina) {
        board[r][c].adiacenti = 0;
        continue;
      }
      let n = 0;
      for (const nb of neighborsOf(righe, cols, r, c)) {
        if (board[nb.r][nb.c].mina) n++;
      }
      board[r][c].adiacenti = n;
    }
  }
}

/**
 * Crea una board con esattamente N mine.
 * Se `safeFirst` è in bounds, la cella e i suoi vicini sono esclusi dal
 * piazzamento: la prima apertura su `safeFirst` è sempre sicura (mai mina)
 * e apre una zona piacevole quando possibile.
 * `rand` è iniettabile per test deterministici.
 */
export function createBoard(
  righe: number,
  cols: number,
  mine: number,
  safeFirst?: Pos,
  rand: () => number = Math.random,
): Board {
  const r = Math.max(1, Math.floor(righe));
  const cl = Math.max(1, Math.floor(cols));
  const board = emptyBoard(r, cl);

  const safeInBounds =
    safeFirst != null && safeFirst.r >= 0 && safeFirst.c >= 0 && safeFirst.r < r && safeFirst.c < cl;
  const excluded = new Set<string>();
  if (safeInBounds && safeFirst) {
    excluded.add(`${safeFirst.r},${safeFirst.c}`);
    for (const nb of neighborsOf(r, cl, safeFirst.r, safeFirst.c)) {
      excluded.add(`${nb.r},${nb.c}`);
    }
  }

  const candidates: Pos[] = [];
  for (let rr = 0; rr < r; rr++) {
    for (let cc = 0; cc < cl; cc++) {
      if (!excluded.has(`${rr},${cc}`)) candidates.push({ r: rr, c: cc });
    }
  }
  // Mai più mine delle celle disponibili (meno la zona sicura se presente).
  const wanted = Math.max(0, Math.min(Math.floor(mine), candidates.length));

  // Fisher-Yates con rand iniettabile.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1)) % (i + 1);
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  for (let i = 0; i < wanted; i++) {
    board[candidates[i].r][candidates[i].c].mina = true;
  }

  computeAdiacenti(board);
  return board;
}

/**
 * Apre la cella (r, c) con flood fill sugli zeri. Restituisce una NUOVA board.
 * - Cella con bandiera o già aperta: invariata (la bandiera non si apre).
 * - Cella mina: viene aperta (sconfitta, vedi isLost).
 * - Cella con adiacenti == 0: apre ricorsivamente i vicini sicuri non bandierati.
 */
export function openCell(board: Board, r: number, c: number): Board {
  const next = cloneBoard(board);
  if (!inBounds(next, r, c)) return next;
  const start = next[r][c];
  if (start.aperta || start.bandiera) return next;

  const righe = next.length;
  start.aperta = true;
  // Mina aperta: partita persa, nessun flood fill.
  if (start.mina) return next;
  if (start.adiacenti > 0) return next;

  const stack: Pos[] = [{ r, c }];
  while (stack.length > 0) {
    const cur = stack.pop() as Pos;
    const cols = next[cur.r].length;
    for (const nb of neighborsOf(righe, cols, cur.r, cur.c)) {
      const cell = next[nb.r][nb.c];
      if (cell.aperta || cell.bandiera || cell.mina) continue;
      cell.aperta = true;
      if (cell.adiacenti === 0) stack.push(nb);
    }
  }
  return next;
}

/**
 * Attiva/disattiva la bandiera su (r, c). Restituisce una NUOVA board.
 * Le celle aperte non possono ricevere bandiere.
 */
export function toggleFlag(board: Board, r: number, c: number): Board {
  const next = cloneBoard(board);
  if (!inBounds(next, r, c)) return next;
  const cell = next[r][c];
  if (cell.aperta) return next;
  cell.bandiera = !cell.bandiera;
  return next;
}

/** True se una mina è stata aperta. */
export function isLost(board: Board): boolean {
  return board.some((row) => row.some((cell) => cell.mina && cell.aperta));
}

/** True se tutte le celle sicure sono aperte (le mine possono essere bandierate o no). */
export function isWon(board: Board): boolean {
  let safeCount = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mina) {
        safeCount++;
        if (!cell.aperta) return false;
      }
    }
  }
  return safeCount > 0;
}

/** Numero di mine sulla board. */
export function countMine(board: Board): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell.mina) n++;
  return n;
}

/** Numero di bandiere piazzate. */
export function countBandiere(board: Board): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell.bandiera) n++;
  return n;
}

/** Numero di celle aperte (utile per debug/statistiche). */
export function countAperte(board: Board): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell.aperta) n++;
  return n;
}
