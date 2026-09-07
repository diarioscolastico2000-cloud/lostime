export type CuriosityCardProps = {
  titolo: string;
  /** nuovo formato */ testo?: string;
  /** formato storico */ descrizione?: string;
  /** nuovo formato */ fonteNome?: string;
  fonteUrl?: string;
  /** formato storico */ link?: string;
  tags?: string[];
  categoria?: string;
};

/**
 * Card curiosità giocoso-minimale (dark default).
 * Accetta sia il formato storico {titolo, descrizione, link}
 * sia quello nuovo {titolo, testo, fonteNome, fonteUrl, tags}.
 */
export function CuriosityCard(props: CuriosityCardProps) {
  const testo = props.testo ?? props.descrizione ?? '';
  const href = props.fonteUrl ?? props.link ?? '#';
  const esterno = href.startsWith('http');
  const tags = props.tags ?? (props.categoria ? [props.categoria] : []);

  return (
    <article
      style={{
        borderRadius: 16, padding: 16, background: '#1e1e2a', color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,.35)', display: 'grid', gap: 8,
      }}
    >
      <h3 style={{ margin: 0 }}>{props.titolo}</h3>
      <p style={{ margin: 0, opacity: 0.9 }}>{testo}</p>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{ fontSize: 12, borderRadius: 999, padding: '4px 10px', background: '#7C5CFF' }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <a
          href={href}
          target={esterno ? '_blank' : undefined}
          rel="noreferrer"
          aria-label={`Apri ${props.titolo}`}
          style={{
            minHeight: 40, display: 'inline-flex', alignItems: 'center',
            borderRadius: 12, padding: '8px 14px', background: '#FFD23F',
            color: '#1a1a1a', fontWeight: 700, textDecoration: 'none',
          }}
        >
          Apri {esterno ? '↗' : ''}
        </a>
        {props.fonteNome && (
          <small style={{ opacity: 0.7 }}>Fonte: {props.fonteNome}</small>
        )}
        {esterno && (
          <small style={{ opacity: 0.7 }}>esterno • gratis • no account</small>
        )}
      </div>
    </article>
  );
}
