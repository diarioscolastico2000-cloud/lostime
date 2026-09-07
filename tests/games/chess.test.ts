import { describe, it, expect } from 'vitest';
import { fenToTurn, isCheckmate, initialFen } from '../../src/features/games/chess/chessEngine';
describe('scacchi', () => {
  it('posizione iniziale tocca al bianco', () => {
    expect(fenToTurn(initialFen())).toBe('w');
  });
  it('matto del barbiere rilevato', () => {
    const fen = 'r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 3';
    expect(isCheckmate(fen)).toBe(true);
  });
});
