import { Chess } from 'chess.js';
export function initialFen(): string { return new Chess().fen(); }
export function fenToTurn(fen: string): 'w'|'b' { return new Chess(fen).turn(); }
export function isCheckmate(fen: string): boolean { const c = new Chess(fen); return c.isCheckmate(); }
export function isDraw(fen: string): boolean { const c = new Chess(fen); return c.isDraw() || c.isStalemate(); }
export function tryMove(fen: string, from: string, to: string, promotion = 'q'): { ok: boolean, fen: string } {
  const c = new Chess(fen);
  try { const m = c.move({ from, to, promotion }); if (!m) return { ok: false, fen }; return { ok: true, fen: c.fen() }; }
  catch { return { ok: false, fen }; }
}
