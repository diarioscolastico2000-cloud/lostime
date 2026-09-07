import { Link } from 'react-router-dom';

/** 404 giocosa: mai un vicolo cieco, sempre una CTA. */
export function NotFound() {
  return (
    <div style={{ display: 'grid', gap: 12, textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ fontSize: 64 }} aria-hidden>🕳️</div>
      <h1>Hai perso tempo… nel posto sbagliato</h1>
      <p>Questa pagina non esiste (o il codice stanza è sbagliato).</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/"
          style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', borderRadius: 12, padding: '8px 18px', background: '#FFD23F', color: '#1a1a1a', fontWeight: 700, textDecoration: 'none' }}
        >
          Torna a casa
        </Link>
        <Link
          to="/giochi/tris"
          style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', borderRadius: 12, padding: '8px 18px', background: '#7C5CFF', color: '#fff', fontWeight: 700, textDecoration: 'none' }}
        >
          Crea lobby Tris
        </Link>
        <Link to="/curiosita" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
          o perditi nelle curiosità
        </Link>
      </div>
    </div>
  );
}
