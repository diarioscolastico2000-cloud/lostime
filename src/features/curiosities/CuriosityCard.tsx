import { Link } from 'react-router-dom';

export type CuriosityCardProps = {
  id?: string;
  titolo: string;
  /** nuovo formato */ testo?: string;
  /** formato storico */ descrizione?: string;
  /** nuovo formato */ fonteNome?: string;
  fonteUrl?: string;
  /** formato storico */ link?: string;
  tags?: string[];
  categoria?: string;
  /** link interno alla scheda dettaglio (es. /curiosita/:id) */
  detailHref?: string;
};

const EMOJI_PER_CATEGORIA: Record<string, string> = {
  scienza: '🔬',
  natura: '🌿',
  spazio: '🪐',
  storia: '📜',
  mappe: '🗺️',
  cielo: '✈️',
  mare: '🌊',
  corpo: '🫀',
  cibo: '🍯',
};

/**
 * Card curiosità giocoso-minimale (dark default), uniforme a ContentCard.
 * Accetta sia il formato storico {titolo, descrizione, link}
 * sia quello nuovo {titolo, testo, fonteNome, fonteUrl, tags}.
 */
export function CuriosityCard(props: CuriosityCardProps) {
  const testo = props.testo ?? props.descrizione ?? '';
  const href = props.fonteUrl ?? props.link ?? '#';
  const esterno = href.startsWith('http');
  const tags = props.tags ?? (props.categoria ? [props.categoria] : []);
  const emoji =
    EMOJI_PER_CATEGORIA[props.categoria ?? ''] ?? EMOJI_PER_CATEGORIA[tags[0] ?? ''] ?? '✨';
  const detailHref = props.detailHref ?? (props.id ? `/curiosita/${props.id}` : undefined);

  return (
    <article className="lt-card">
      <div className="lt-card-cover-fallback" aria-hidden="true">
        {emoji}
      </div>
      <div className="lt-card-body">
        <h3 className="lt-card-title">{props.titolo}</h3>
        <p className="lt-card-desc">{testo}</p>
        {tags.length > 0 && (
          <div className="lt-tags" aria-label="tag">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="lt-tag">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="lt-card-foot">
          <a
            href={href}
            target={esterno ? '_blank' : undefined}
            rel="noreferrer"
            aria-label={`Apri ${props.titolo}`}
            className="lt-btn"
          >
            Apri {esterno ? '↗' : ''}
          </a>
          {props.fonteNome && <small className="lt-meta">Fonte: {props.fonteNome}</small>}
          {esterno && <small className="lt-meta">esterno • gratis • no account</small>}
        </div>
        {detailHref && (
          <div>
            <Link className="lt-btn-ghost" to={detailHref} aria-label={`Scheda di ${props.titolo}`}>
              Scheda →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
