import { Link } from 'react-router-dom';
import { useSearch } from './useSearch';
import { FilterChips } from './FilterChips';

export function SearchBar() {
  const { query, setQuery, setPlayers, tags, toggleTag, maxDurata, setMaxDurata, results } =
    useSearch();
  const hasQuery = query.trim().length > 0 || tags.length > 0;
  return (
    <div className="lt-searchbar">
      <input
        aria-label="cerca"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca aerei, carte, quiz…"
        className="lt-search-input"
        type="search"
      />
      <div className="lt-quick-filters" role="group" aria-label="filtri rapidi">
        <button type="button" className="lt-chip" onClick={() => setPlayers(1)}>
          1 giocatore
        </button>
        <button type="button" className="lt-chip" onClick={() => setPlayers(2)}>
          2 giocatori
        </button>
        <button type="button" className="lt-chip" onClick={() => setPlayers(undefined)}>
          Tutti
        </button>
        <button
          type="button"
          className="lt-chip"
          onClick={() => setMaxDurata(5)}
          aria-pressed={maxDurata === 5}
        >
          ≤ 5 min
        </button>
        <button
          type="button"
          className="lt-chip"
          onClick={() => setMaxDurata(undefined)}
        >
          Qualsiasi durata
        </button>
      </div>
      <FilterChips active={tags} onToggle={toggleTag} />
      {hasQuery && (
        <ul className="lt-results" aria-live="polite">
          {results.length === 0 && (
            <li className="lt-result">Niente trovato — prova “scacchi”, “mappa” o “quiz”.</li>
          )}
          {results.slice(0, 6).map((r) => (
            <li key={r.id} className="lt-result">
              <strong>{r.titolo}</strong>
              <div className="lt-meta">{r.descrizione}</div>
              <div className="lt-result-links">
                {r.rottaInterna && <Link to={r.rottaInterna}>Apri</Link>}
                {r.linkEsterno && (
                  <a href={r.linkEsterno} target="_blank" rel="noreferrer">
                    Esterno ↗
                  </a>
                )}
                <small className="lt-meta">
                  {r.durataMin} min • {r.players.min}–{r.players.max} gioc.
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
