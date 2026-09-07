import { describe, it, expect } from 'vitest';
import { searchContent } from '../../src/features/search/searchIndex';

describe('search', () => {
  it('trova tris cercando 2 giocatori', () => {
    const res = searchContent('tris', { players: 2 });
    expect(res.some(r => r.id === 'tris')).toBe(true);
  });
  it('filtra per durata breve', () => {
    const res = searchContent('', { maxDurata: 3 });
    expect(res.every(r => r.durataMin <= 3)).toBe(true);
  });
});
