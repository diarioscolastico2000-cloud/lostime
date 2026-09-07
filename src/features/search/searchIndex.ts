import content from '../../content/content.json';

export type ContentItem = { id: string, tipo: string, gameId?: string, titolo: string, descrizione: string, tags: string[], players: { min: number, max: number }, durataMin: number, cover?: string, rottaInterna?: string, linkEsterno?: string };

export type SearchFilters = { categoria?: string, players?: number, maxDurata?: number, tags?: string[], soloInterni?: boolean, soloEsterni?: boolean };

export function searchContent(query: string, filters: SearchFilters = {}): ContentItem[] {
  const q = query.toLowerCase().trim();
  return (content as ContentItem[]).filter(c => {
    if (q && !(c.titolo.toLowerCase().includes(q) || c.descrizione.toLowerCase().includes(q) || c.tags.join(' ').includes(q))) return false;
    if (filters.categoria && c.tipo !== filters.categoria && !c.tags.includes(filters.categoria)) return false;
    if (filters.players && !(c.players.min <= filters.players && filters.players <= c.players.max)) return false;
    if (filters.maxDurata && c.durataMin > filters.maxDurata) return false;
    if (filters.tags && filters.tags.length > 0 && !filters.tags.every(t => c.tags.includes(t))) return false;
    if (filters.soloInterni && !c.rottaInterna) return false;
    if (filters.soloEsterni && !c.linkEsterno) return false;
    return true;
  });
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  for (const c of content as ContentItem[]) for (const t of c.tags) set.add(t);
  return [...set].sort();
}
