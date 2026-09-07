import { describe, it, expect } from 'vitest';
import { createLobbyCode } from '../../src/features/lobby/lobbyApi';
import { checkWin } from '../../src/features/games/tictactoe/tictactoeEngine';
describe('lobby', () => {
  it('codice 6 char maiuscole', () => {
    expect(createLobbyCode()).toMatch(/^[A-Z0-9]{6}$/);
  });
  it('tris riga vince', () => {
    expect(checkWin(['X','X','X',null,null,null,null,null,null])).toBe('X');
  });
  it('tris pareggio no vincitore', () => {
    expect(checkWin(['X','O','X','X','O','O','O','X','X'])).toBe('draw');
  });
});
