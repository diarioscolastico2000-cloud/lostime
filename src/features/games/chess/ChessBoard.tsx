import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { initialFen, tryMove } from './chessEngine';
export function ChessBoard({ fen: ext, onMove }: { fen?: string, onMove?: (fen: string) => void }) {
  const [fen, setFen] = useState(ext ?? initialFen());
  const [moves, setMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const cur = ext ?? fen;
  const info = useMemo(() => {
    try {
      const c = new Chess(cur);
      const mate = c.isCheckmate();
      const stale = c.isStalemate();
      const draw = c.isDraw();
      const check = c.inCheck();
      const turn = c.turn() === 'w' ? 'Bianco' : 'Nero';
      return { ok: true, mate, stale, draw, check, turn, pgn: c.pgn() };
    } catch {
      return { ok: false, mate: false, stale: false, draw: false, check: false, turn: '-', pgn: '' };
    }
  }, [cur]);
  const gameOver = info.mate || info.stale || info.draw;
  function onDrop(from: string, to: string): boolean {
    if (gameOver) return false;
    let san = `${from}-${to}`;
    try {
      const c = new Chess(cur);
      const m = c.move({ from, to, promotion: 'q' });
      if (!m) return false;
      san = m.san;
    } catch { /* fallback: valida comunque via engine */ }
    const r = tryMove(cur, from, to);
    if (!r.ok) return false;
    setMoves(p => [...p, san]);
    setLastMove({ from, to });
    if (onMove) onMove(r.fen); else setFen(r.fen);
    return true;
  }
  function nuovaLocale() {
    const f = initialFen();
    setMoves([]);
    setLastMove(null);
    if (onMove) onMove(f); else setFen(f);
  }
  const squareStyles = lastMove
    ? { [lastMove.from]: { backgroundColor: 'rgba(255,213,79,0.65)' }, [lastMove.to]: { backgroundColor: 'rgba(255,213,79,0.65)' } }
    : {};
  const status = !info.ok
    ? 'Posizione non valida'
    : info.mate
      ? `Scacco matto! Vince ${info.turn === 'Bianco' ? 'Nero' : 'Bianco'}`
      : info.stale
        ? 'Patta per stallo.'
        : info.draw
          ? 'Patta.'
          : info.check
            ? `Scacco! Tocca a ${info.turn}`
            : `Tocca a ${info.turn}`;
  return (
    <div>
      <Chessboard
        position={cur}
        onPieceDrop={onDrop}
        arePiecesDraggable={!gameOver}
        customSquareStyles={squareStyles}
        boardWidth={Math.min(480, typeof window !== 'undefined' ? window.innerWidth - 32 : 480)}
      />
      <p data-testid="chess-status" aria-live="polite">{status}</p>
      {lastMove && <p data-testid="chess-last">Ultima mossa: {moves[moves.length - 1] ?? `${lastMove.from}-${lastMove.to}`} ({lastMove.from}→{lastMove.to})</p>}
      <div>
        <h4>Mosse ({moves.length})</h4>
        {moves.length === 0
          ? <p data-testid="chess-moves-empty">Nessuna mossa ancora.</p>
          : <ol data-testid="chess-moves">{moves.map((m, i) => <li key={i}>{m}</li>)}</ol>}
        {info.pgn ? <p data-testid="chess-pgn" style={{ fontSize: 12, opacity: 0.7 }}>PGN: {info.pgn}</p> : null}
      </div>
      <button type="button" onClick={nuovaLocale}>Nuova partita locale</button>
    </div>
  );
}
