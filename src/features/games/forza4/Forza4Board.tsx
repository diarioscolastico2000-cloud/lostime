import { useState } from 'react';
import { COLS, ROWS, checkWin, createBoard, dropPiece, getWinningLine, isDraw, nextTurn, type Board } from './engineForza4';

export function Forza4Board({ board: ext, onMove }: { board?: Board; onMove?: (col: number) => void }) {
  const [local, setLocal] = useState<Board>(() => createBoard());
  const board = ext ?? local;
  const win = checkWin(board);
  const line = getWinningLine(board);
  const draw = isDraw(board);
  const turn = nextTurn(board);
  const over = win !== null || draw;
  const inLine = (r: number, c: number) => line?.some(([lr, lc]) => lr === r && lc === c) ?? false;

  function handleCol(col: number) {
    if (over) return;
    if (onMove) {
      onMove(col);
      return;
    }
    setLocal((b) => dropPiece(b, col)?.board ?? b);
  }

  return (
    <div>
      <p data-testid="f4-status" aria-live="polite">
        {win ? `Vince ${win === 'R' ? 'Rosso' : 'Giallo'}!` : draw ? 'Pareggio!' : `Tocca a ${turn === 'R' ? 'Rosso' : 'Giallo'}`}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS},44px)`, gap: 4 }}>
        {Array.from({ length: COLS }, (_, col) => (
          <button
            key={`drop-${col}`}
            aria-label={`inserisci in colonna ${col}`}
            data-testid={`f4-col-${col}`}
            disabled={over}
            style={{ height: 28, cursor: over ? 'not-allowed' : 'pointer' }}
            onClick={() => handleCol(col)}
          >
            ▼
          </button>
        ))}
        {board.map((row, r) =>
          row.map((v, c) => (
            <div
              key={`${r}-${c}`}
              data-testid={v ? `f4-cell-${r}-${c}-${v}` : `f4-cell-${r}-${c}`}
              aria-label={`cella ${r},${c}${inLine(r, c) ? ' vincente' : ''}`}
              onClick={() => handleCol(c)}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: v === 'R' ? '#ef4444' : v === 'G' ? '#eab308' : '#e5e7eb',
                outline: inLine(r, c) ? '3px solid #166534' : '1px solid #9ca3af',
                cursor: over ? 'not-allowed' : 'pointer',
                transition: 'background 0.25s ease, transform 0.25s ease',
                transform: v ? 'scale(1)' : 'scale(0.85)',
              }}
            />
          )),
        )}
      </div>
      {win && (
        <p>
          Risultato: {win === 'R' ? 'rosso' : 'giallo'} vince ({ROWS}x{COLS})
        </p>
      )}
    </div>
  );
}
