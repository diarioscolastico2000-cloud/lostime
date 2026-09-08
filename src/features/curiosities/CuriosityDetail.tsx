import { Link } from 'react-router-dom';
import { getCuriosities } from './CuriosityGrid';

/** Dettaglio /curiosita/:id — breadcrumb, lettura, fonte, prev/next, correlate. */
export function CuriosityDetail({ id }: { id: string }) {
  const all = getCuriosities();
  const idx = all.findIndex((c) => c.id === id);
  const item = idx >= 0 ? all[idx] : undefined;

  if (!item) {
    return (
      <div className="lt-detail">
        <nav className="lt-crumb" aria-label="breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/curiosita">Curiosità</Link>
        </nav>
        <h1>Curiosità non trovata 🤔</h1>
        <p className="lt-hero-sub">Questo id non esiste (ancora). Esplora le altre o torna a casa.</p>
        <p className="lt-detail-actions">
          <Link className="lt-btn" to="/curiosita">
            Vedi tutte le curiosità
          </Link>
          <Link className="lt-btn-secondary" to="/">
            Home
          </Link>
        </p>
      </div>
    );
  }

  const testo = item.testo ?? item.descrizione ?? '';
  const href = item.fonteUrl ?? item.link ?? '#';
  const esterno = href.startsWith('http');
  const tags = item.tags ?? (item.categoria ? [item.categoria] : []);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx < all.length - 1 ? all[idx + 1] : undefined;
  const correlate = all
    .filter((c) => c.id !== item.id && (c.tags ?? []).some((t) => tags.includes(t)))
    .slice(0, 3);

  return (
    <div className="lt-detail">
      <nav className="lt-crumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/curiosita">Curiosità</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{item.titolo}</span>
      </nav>

      <article className="lt-detail-card">
        <h1>{item.titolo}</h1>
        {tags.length > 0 && (
          <div className="lt-tags" aria-label="tag">
            {tags.map((t) => (
              <span key={t} className="lt-tag">
                {t}
              </span>
            ))}
          </div>
        )}
        <p className="lt-lead">{testo}</p>
        <div className="lt-detail-actions">
          <a
            className="lt-btn"
            href={href}
            target={esterno ? '_blank' : undefined}
            rel="noreferrer"
          >
            {esterno ? 'Apri fonte esterna ↗' : 'Apri'}
          </a>
          {item.fonteNome && <small className="lt-meta">Fonte: {item.fonteNome}</small>}
          {esterno && <small className="lt-meta">link esterno • gratis • no account</small>}
        </div>
      </article>

      <nav className="lt-detail-nav" aria-label="Navigazione curiosità">
        {prev ? (
          <Link to={`/curiosita/${prev.id}`}>
            <small>← Precedente</small>
            <strong>{prev.titolo}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/curiosita/${next.id}`}>
            <small>Successiva →</small>
            <strong>{next.titolo}</strong>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {correlate.length > 0 && (
        <section>
          <h2>Correlate</h2>
          <ul className="lt-related">
            {correlate.map((c) => (
              <li key={c.id} className="lt-list-item">
                <Link to={`/curiosita/${c.id}`}>{c.titolo}</Link>
                <small className="lt-meta">{c.testo ?? c.descrizione ?? ''}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
