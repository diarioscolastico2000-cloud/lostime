import { useState } from 'react';
import { checkWin, type Board } from './tictactoeEngine';
export function TicTacToeBoard({ board: ext, onMove }: { board?: Board, onMove?: (i: number) => void }) {
  const [local, setLocal] = useState<Board>(Array(9).fill(null));
  const board = ext ?? local;
  const win = checkWin(board);
  return (<div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,64px)', gap: 8 }}>{board.map((v, i) => <button key={i} style={{ width: 64, height: 64, fontSize: 28 }} onClick={() => { if (onMove) onMove(i); else setLocal(b => { if (b[i] || checkWin(b)) return b; const n = [...b] as Board; const x = b.filter(x => x === 'X').length; const o = b.filter(x => x === 'O').length; n[i] = x <= o ? 'X' : 'O'; return n; }); }}>{v}</button>)}</div>{win && <p>Risultato: {win}</p>}</div>);
}
