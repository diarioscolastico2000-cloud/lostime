import { describe, expect, it } from 'vitest';
import { applyTrisMove, emptyTrisPayload, type GamePayload } from '../../src/features/lobby/useGameState';

describe('useGameState pure helpers', () => {
  it('emptyTrisPayload: board di 9 null', () => {
    const p = emptyTrisPayload();
    expect(p.board).toHaveLength(9);
    expect(p.board.every((v: null | 'X' | 'O') => v === null)).toBe(true);
  });

  it('mossa valida: prima X poi O', () => {
    const p0 = emptyTrisPayload();
    const p1 = applyTrisMove(p0, 0);
    expect(p1).not.toBeNull();
    expect(p1!.board[0]).toBe('X');
    const p2 = applyTrisMove(p1!, 1);
    expect(p2).not.toBeNull();
    expect(p2!.board[1]).toBe('O');
    // Non muta l'input.
    expect(p1!.board[1]).toBe(null);
  });

  it('cella piena: ritorna null', () => {
    const p1 = applyTrisMove(emptyTrisPayload(), 4)!;
    expect(applyTrisMove(p1, 4)).toBeNull();
  });

  it('blocco a fine partita: vittoria', () => {
    const vinto: GamePayload = {
      board: ['X', 'X', 'X', null, 'O', 'O', null, null, null],
    };
    expect(applyTrisMove(vinto, 3)).toBeNull();
  });

  it('blocco a fine partita: pareggio', () => {
    const pareggio: GamePayload = {
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
    };
    expect(applyTrisMove(pareggio, 0)).toBeNull();
  });

  it('indice fuori range: ritorna null', () => {
    expect(applyTrisMove(emptyTrisPayload(), -1)).toBeNull();
    expect(applyTrisMove(emptyTrisPayload(), 9)).toBeNull();
  });
});
