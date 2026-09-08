export type Board = (null|'X'|'O')[];
const LINES: number[][] = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function getWinningLine(b: Board): number[] | null {
  for (const [a,c,d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return [a,c,d];
  return null;
}
export function checkWin(b: Board): 'X'|'O'|'draw'|null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] as 'X'|'O';
  if (b.every(Boolean)) return 'draw';
  return null;
}
export function nextTurn(b: Board): 'X'|'O' {
  const x = b.filter(v => v === 'X').length;
  const o = b.filter(v => v === 'O').length;
  return x <= o ? 'X' : 'O';
}
