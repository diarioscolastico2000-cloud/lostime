import { useMemo, useState } from 'react';
import { searchContent } from './searchIndex';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState<number | undefined>(undefined);
  const [categoria, setCategoria] = useState<string | undefined>(undefined);
  const [maxDurata, setMaxDurata] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);

  const results = useMemo(
    () => searchContent(query, { players, categoria, maxDurata, tags }),
    [query, players, categoria, maxDurata, tags],
  );

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  return { query, setQuery, players, setPlayers, categoria, setCategoria, maxDurata, setMaxDurata, tags, setTags, toggleTag, results };
}
