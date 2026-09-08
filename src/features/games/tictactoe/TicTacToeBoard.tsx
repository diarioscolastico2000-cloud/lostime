import { useState } from 'react';
import { checkWin, getWinningLine, nextTurn, type Board } from './tictactoeEngine';
export function TicTacToeBoard({ board: ext, onMove }: { board?: Board, onMove?: (i: number) => void }) {
  const [local, setLocal] = useState<Board>(Array(9).fill(null));
  const board = ext ?? local;
  const win = checkWin(board);
  const line = getWinningLine(board);
  const inLine = (i: number) => line?.includes(i) ?? false;
  const turn = nextTurn(board);
  const over = win !== null;
  function handleClick(i: number) {
    if (board[i] || over) return;
    if (onMove) { onMove(i); return; }
    setLocal(b => {
      if (b[i] || checkWin(b)) return b;
      const n = [...b] as Board;
      const x = b.filter(v => v === 'X').length;
      const o = b.filter(v => v === 'O').length;
      n[i] = x <= o ? 'X' : 'O';
      return n;
    });
  }
  return (
    <div>
      <p data-testid="ttt-status" aria-live="polite">
        {win === 'draw' ? 'Pareggio!' : win ? `Vince ${win}!` : `Tocca a ${turn}`}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,64px)', gap: 8 }}>
        {board.map((v, i) => (
          <button
            key={i}
            aria-label={`cella ${i}${inLine(i) ? ' vincente' : ''}`}
            disabled={over || !!v}
            style={{
              width: 64, height: 64, fontSize: 28, cursor: over || v ? 'not-allowed' : 'pointer',
              background: inLine(i) ? '#fbbf24' : undefined,
              outline: inLine(i) ? '3px solid #b45309' : undefined,
            }}
            onClick={() => handleClick(i)}
          >
            {v}
          </button>
        ))}
      </div>
      {win && <p>Risultato: {win === 'draw' ? 'pareggio' : `${win} vince`}</p>}
    </div>
  );
}
