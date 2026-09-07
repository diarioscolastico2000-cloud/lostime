import { searchContent, type ContentItem } from './searchIndex';
import { getCuriosities, type CuriosityItem } from '../curiosities/CuriosityGrid';

export type HomeSections = {
  giochiDue: ContentItem[];
  veloci: ContentItem[];
  esplora: ContentItem[];
  curiosita: CuriosityItem[];
};

/** Sezioni Home: "Giochi in 2" → "5 minuti" → "Esplora live" → "Curiosità". */
export function getHomeSections(): HomeSections {
  const giochiDue = searchContent('', { players: 2 }).filter((c) => c.tipo === 'gioco').slice(0, 4);
  const veloci = searchContent('', { maxDurata: 5 }).filter((c) => c.tipo === 'gioco').slice(0, 4);
  const esplora = searchContent('', { tags: ['mappa'] }).slice(0, 4);
  const curiosita = getCuriosities().slice(0, 6);
  return { giochiDue, veloci, esplora, curiosita };
}

/** Hub /giochi: interni prima, poi esterni gratis. */
export function getGiochiHub(): { interni: ContentItem[]; esterni: ContentItem[] } {
  const interni = searchContent('').filter((c) => c.tipo === 'gioco' && c.rottaInterna);
  const esterni = searchContent('').filter((c) => c.tipo === 'gioco' && c.linkEsterno);
  return { interni, esterni };
}
