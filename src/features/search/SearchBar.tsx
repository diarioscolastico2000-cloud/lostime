import { Link } from 'react-router-dom';
import { useSearch } from './useSearch';
import { FilterChips } from './FilterChips';

export function SearchBar() {
  const { query, setQuery, setPlayers, tags, toggleTag, maxDurata, setMaxDurata, results } = useSearch();
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <input aria-label="cerca" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca aerei, carte, quiz..." style={{ minHeight: 44, width: '100%', borderRadius: 12, padding: '0 14px' }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={{ minHeight: 40 }} onClick={() => setPlayers(1)}>1 giocatore</button>
        <button style={{ minHeight: 40 }} onClick={() => setPlayers(2)}>2 giocatori</button>
        <button style={{ minHeight: 40 }} onClick={() => setPlayers(undefined)}>Tutti</button>
        <button style={{ minHeight: 40 }} onClick={() => setMaxDurata(5)}>≤ 5 min</button>
        <button style={{ minHeight: 40 }} onClick={() => setMaxDurata(undefined)}>Qualsiasi durata{maxDurata ? '' : ''}</button>
      </div>
      <FilterChips active={tags} onToggle={toggleTag} />
      <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
        {results.map(r => (
          <li key={r.id} style={{ borderRadius: 12, padding: 12, background: '#1e1e2a' }}>
            <strong>{r.titolo}</strong>
            <div style={{ opacity: 0.8, fontSize: 14 }}>{r.descrizione}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {r.rottaInterna && <Link to={r.rottaInterna}>Apri</Link>}
              {r.linkEsterno && <a href={r.linkEsterno} target="_blank" rel="noreferrer">Esterno ↗</a>}
              <small style={{ opacity: 0.7 }}>{r.durataMin} min • {r.players.min}–{r.players.max} gioc.</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
