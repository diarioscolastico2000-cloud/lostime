export const ROWS = 6;
export const COLS = 7;

export type Piece = 'R' | 'G';
export type Cell = Piece | null;
/** Griglia 6 righe x 7 colonne. board[r][c], r=0 in alto. */
export type Board = Cell[][];

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

export function nextTurn(b: Board): Piece {
  let r = 0;
  let g = 0;
  for (const row of b) for (const c of row) {
    if (c === 'R') r++;
    else if (c === 'G') g++;
  }
  return r <= g ? 'R' : 'G';
}

/** Impila il gettone del turno corrente in colonna col. Ritorna nuova board + riga, o null se piena/non valida. */
export function dropPiece(b: Board, col: number): { board: Board; row: number } | null {
  if (col < 0 || col >= COLS) return null;
  if (checkWin(b)) return null;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!b[r][col]) {
      const board = b.map((row) => [...row]) as Board;
      board[r][col] = nextTurn(b);
      return { board, row: r };
    }
  }
  return null;
}

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function getWinningLine(b: Board): [number, number][] | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (!p) continue;
      for (const [dr, dc] of DIRS) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || b[nr][nc] !== p) break;
          line.push([nr, nc]);
        }
        if (line.length === 4) return line;
      }
    }
  }
  return null;
}

export function checkWin(b: Board): Piece | null {
  const line = getWinningLine(b);
  return line ? (b[line[0][0]][line[0][1]] as Piece) : null;
}

export function isDraw(b: Board): boolean {
  if (checkWin(b)) return false;
  return b.every((row) => row.every(Boolean));
}
