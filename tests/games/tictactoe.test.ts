import { describe, it, expect } from 'vitest';
import { checkWin, getWinningLine, nextTurn, type Board } from '../../src/features/games/tictactoe/tictactoeEngine';
describe('getWinningLine', () => {
  it('riga X -> [0,1,2]', () => {
    const b: Board = ['X','X','X',null,null,null,null,null,null];
    expect(getWinningLine(b)).toEqual([0,1,2]);
    expect(checkWin(b)).toBe('X');
  });
  it('diagonale O -> [0,4,8]', () => {
    const b: Board = ['O',null,null,null,'O',null,null,null,'O'];
    expect(getWinningLine(b)).toEqual([0,4,8]);
    expect(checkWin(b)).toBe('O');
  });
  it('colonna -> [1,4,7]', () => {
    const b: Board = [null,'X',null,null,'X',null,null,'X',null];
    expect(getWinningLine(b)).toEqual([1,4,7]);
  });
  it('nessuna vittoria -> null', () => {
    expect(getWinningLine(Array(9).fill(null))).toBeNull();
  });
  it('pareggio -> null (checkWin resta draw)', () => {
    const b: Board = ['X','O','X','X','O','O','O','X','X'];
    expect(checkWin(b)).toBe('draw');
    expect(getWinningLine(b)).toBeNull();
  });
  it('nextTurn non rotto', () => {
    expect(nextTurn(Array(9).fill(null))).toBe('X');
    expect(nextTurn(['X',null,null,null,null,null,null,null,null])).toBe('O');
  });
});
