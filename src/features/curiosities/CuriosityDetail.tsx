import { Link } from 'react-router-dom';
import { CuriosityCard } from './CuriosityCard';
import { getCuriosities } from './CuriosityGrid';

/** Dettaglio /curiosita/:id — predisposto futuro da spec, ora attivo. */
export function CuriosityDetail({ id }: { id: string }) {
  const all = getCuriosities();
  const item = all.find((c) => c.id === id);

  if (!item) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>Curiosità non trovata 🤔</h1>
        <p>Questo id non esiste (ancora). Esplora le altre o torna a casa.</p>
        <p>
          <Link to="/curiosita">Vedi tutte le curiosità</Link> • <Link to="/">Home</Link>
        </p>
      </div>
    );
  }

  const tags = item.tags ?? (item.categoria ? [item.categoria] : []);
  const correlate = all
    .filter((c) => c.id !== item.id && (c.tags ?? []).some((t) => tags.includes(t)))
    .slice(0, 3);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <p>
        <Link to="/curiosita">← Tutte le curiosità</Link>
      </p>
      <CuriosityCard
        titolo={item.titolo}
        testo={item.testo ?? item.descrizione}
        descrizione={item.descrizione}
        fonteNome={item.fonteNome}
        fonteUrl={item.fonteUrl ?? item.link}
        link={item.link}
        tags={item.tags}
        categoria={item.categoria}
      />
      {correlate.length > 0 && (
        <section>
          <h2>Correlate</h2>
          <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
            {correlate.map((c) => (
              <li key={c.id}>
                <Link to={`/curiosita/${c.id}`}>{c.titolo}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
