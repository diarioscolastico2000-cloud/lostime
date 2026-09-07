import { Link } from 'react-router-dom';
import type { ContentItem } from './searchIndex';

/** Card unificata per voci content.json: cover, tags, link interno/esterno. */
export function ContentCard({ item }: { item: ContentItem }) {
  const esterno = Boolean(item.linkEsterno);
  const href = item.linkEsterno ?? item.rottaInterna ?? '#';
  const tags = item.tags.slice(0, 4);

  const body = (
    <>
      <img
        src={item.cover ?? '/covers/wiki.png'}
        alt=""
        loading="lazy"
        width={800}
        height={450}
        style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 12, background: '#2a2a3a' }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <h3 style={{ margin: '8px 0 0' }}>{item.titolo}</h3>
      <p style={{ margin: '4px 0', opacity: 0.85, fontSize: 14 }}>{item.descrizione}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((t) => (
          <span key={t} style={{ fontSize: 12, borderRadius: 999, padding: '2px 10px', background: '#2a2a3a' }}>
            {t}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            minHeight: 40, display: 'inline-flex', alignItems: 'center',
            borderRadius: 12, padding: '8px 14px', background: '#FFD23F',
            color: '#1a1a1a', fontWeight: 700,
          }}
        >
          {esterno ? 'Esterno ↗' : 'Apri'}
        </span>
        <small style={{ opacity: 0.7 }}>
          {item.durataMin} min • {item.players.min}–{item.players.max} gioc.
        </small>
        {esterno && <small style={{ opacity: 0.7 }}>gratis • no account</small>}
      </div>
    </>
  );

  return (
    <article style={{ borderRadius: 16, padding: 12, background: '#1e1e2a', color: '#fff', display: 'grid', gap: 4 }}>
      {esterno ? (
        <a href={href} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'grid', gap: 4 }}>
          {body}
        </a>
      ) : (
        <Link to={href} style={{ color: 'inherit', textDecoration: 'none', display: 'grid', gap: 4 }}>
          {body}
        </Link>
      )}
    </article>
  );
}
