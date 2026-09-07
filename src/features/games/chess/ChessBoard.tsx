import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { initialFen, tryMove, isCheckmate } from './chessEngine';
export function ChessBoard({ fen: ext, onMove }: { fen?: string, onMove?: (fen: string) => void }) {
  const [fen, setFen] = useState(ext ?? initialFen());
  const cur = ext ?? fen;
  function onDrop(from: string, to: string): boolean {
    const r = tryMove(cur, from, to);
    if (!r.ok) return false;
    if (onMove) onMove(r.fen); else setFen(r.fen);
    return true;
  }
  return (<div><Chessboard position={cur} onPieceDrop={onDrop} boardWidth={Math.min(480, typeof window !== 'undefined' ? window.innerWidth - 32 : 480)} /><p>{isCheckmate(cur) ? 'Scacco matto!' : `Tocca a ${cur.split(' ')[1] === 'w' ? 'Bianco' : 'Nero'}`}</p></div>);
}
