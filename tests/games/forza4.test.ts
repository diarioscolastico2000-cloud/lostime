import { describe, it, expect } from 'vitest';
import { COLS, ROWS, checkWin, createBoard, dropPiece, getWinningLine, isDraw, nextTurn, type Board } from '../../src/features/games/forza4/engineForza4';

function fromRows(rows: (('R' | 'G' | null)[])[]): Board {
  return rows.map((r) => [...r]);
}
const empty = () => createBoard();

describe('forza4 engine', () => {
  it(`griglia ${ROWS}x${COLS} vuota`, () => {
    const b = empty();
    expect(b).toHaveLength(ROWS);
    expect(b.every((r) => r.length === COLS && r.every((c) => c === null))).toBe(true);
  });
  it('drop impila dal basso, Rosso inizia', () => {
    const b = empty();
    const r1 = dropPiece(b, 3);
    expect(r1?.row).toBe(ROWS - 1);
    expect(r1?.board[ROWS - 1][3]).toBe('R');
    const r2 = dropPiece(r1!.board, 3);
    expect(r2?.row).toBe(ROWS - 2);
    expect(r2?.board[ROWS - 2][3]).toBe('G');
  });
  it('colonna piena -> null', () => {
    let b = empty();
    for (let i = 0; i < ROWS; i++) b = dropPiece(b, 0)!.board;
    expect(dropPiece(b, 0)).toBeNull();
  });
  it('vittoria orizzontale Rosso', () => {
    const b = fromRows([
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      ['R', 'R', 'R', 'R', null, null, null],
    ]);
    expect(checkWin(b)).toBe('R');
    expect(getWinningLine(b)).toEqual([[5, 0], [5, 1], [5, 2], [5, 3]]);
  });
  it('vittoria verticale Giallo', () => {
    const b = fromRows([
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      ['G', null, null, null, null, null, null],
      ['G', null, null, null, null, null, null],
      ['G', null, null, null, null, null, null],
      ['G', null, null, null, null, null, null],
    ]);
    expect(checkWin(b)).toBe('G');
    expect(getWinningLine(b)).toEqual([[2, 0], [3, 0], [4, 0], [5, 0]]);
  });
  it('vittoria diagonale /', () => {
    const b = fromRows([
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, 'R', null, null, null],
      [null, null, 'R', 'G', null, null, null],
      [null, 'R', 'G', 'G', null, null, null],
      ['R', 'G', 'G', 'G', null, null, null],
    ]);
    expect(checkWin(b)).toBe('R');
    expect(getWinningLine(b)).toEqual([[2, 3], [3, 2], [4, 1], [5, 0]]);
  });
  it('vittoria diagonale \\', () => {
    const b = fromRows([
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      ['G', null, null, null, null, null, null],
      ['R', 'G', null, null, null, null, null],
      ['R', 'R', 'G', null, null, null, null],
      ['R', 'R', 'R', 'G', null, null, null],
    ]);
    expect(checkWin(b)).toBe('G');
    expect(getWinningLine(b)).toEqual([[2, 0], [3, 1], [4, 2], [5, 3]]);
  });
  it('nessuna vittoria -> null', () => {
    expect(checkWin(empty())).toBeNull();
    expect(getWinningLine(empty())).toBeNull();
  });
  it('pareggio: piena senza 4', () => {
    // Pattern a blocchi 2x2 sfalsati: mai 4 uguali in riga/colonna/diagonale
    const b = fromRows([
      ['R', 'R', 'G', 'G', 'R', 'R', 'G'],
      ['G', 'G', 'R', 'R', 'G', 'G', 'R'],
      ['R', 'R', 'G', 'G', 'R', 'R', 'G'],
      ['G', 'G', 'R', 'R', 'G', 'G', 'R'],
      ['R', 'R', 'G', 'G', 'R', 'R', 'G'],
      ['G', 'G', 'R', 'R', 'G', 'G', 'R'],
    ]);
    expect(checkWin(b)).toBeNull();
    expect(isDraw(b)).toBe(true);
  });
  it('nextTurn alterna R/G', () => {
    const b = empty();
    expect(nextTurn(b)).toBe('R');
    expect(nextTurn(dropPiece(b, 0)!.board)).toBe('G');
  });
});
