import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ContentItem } from './searchIndex';

/** Card unificata per voci content.json: cover con fallback, tags, CTA, badge. */
export function ContentCard({ item }: { item: ContentItem }) {
  const [imgKo, setImgKo] = useState(false);
  const esterno = Boolean(item.linkEsterno);
  const href = item.linkEsterno ?? item.rottaInterna ?? '#';
  const tags = item.tags.slice(0, 4);
  const showCover = Boolean(item.cover) && !imgKo;
  const fallbackLetter = (item.titolo.trim().charAt(0) || 'L').toUpperCase();
  const cta = esterno ? 'Esterno ↗' : item.rottaInterna ? 'Gioca' : 'Apri';

  const body = (
    <>
      {showCover ? (
        <img
          src={item.cover}
          alt=""
          loading="lazy"
          width={800}
          height={450}
          className="lt-card-cover"
          onError={() => setImgKo(true)}
        />
      ) : (
        <div className="lt-card-cover-fallback" aria-hidden="true">
          {fallbackLetter}
        </div>
      )}
      <div className="lt-card-body">
        <h3 className="lt-card-title">{item.titolo}</h3>
        <p className="lt-card-desc">{item.descrizione}</p>
        <div className="lt-tags" aria-label="tag">
          {tags.map((t) => (
            <span key={t} className="lt-tag-soft">
              {t}
            </span>
          ))}
        </div>
        <div className="lt-card-foot">
          <span className="lt-btn" aria-hidden="true">
            {cta}
          </span>
          <small className="lt-meta">
            {item.durataMin} min • {item.players.min}–{item.players.max} gioc.
          </small>
          {esterno && <small className="lt-meta">gratis • no account</small>}
        </div>
      </div>
    </>
  );

  return (
    <article className="lt-card">
      {esterno ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="lt-card-link"
          aria-label={`${item.titolo} — sito esterno`}
        >
          {body}
        </a>
      ) : (
        <Link to={href} className="lt-card-link" aria-label={`${item.titolo} — apri`}>
          {body}
        </Link>
      )}
    </article>
  );
}
