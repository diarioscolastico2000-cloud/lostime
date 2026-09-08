import { Link } from 'react-router-dom';

/** 404 giocosa: mai un vicolo cieco, sempre una CTA. */
export function NotFound() {
  return (
    <div className="lt-404">
      <div className="lt-404-emoji" aria-hidden="true">
        🕳️⏳
      </div>
      <h1>Hai perso tempo… nel posto sbagliato</h1>
      <p className="lt-hero-sub">Questa pagina non esiste (o il codice stanza è sbagliato).</p>
      <div className="lt-404-actions">
        <Link to="/" className="lt-btn">
          Torna a casa
        </Link>
        <Link to="/giochi/tris" className="lt-btn-secondary">
          Crea lobby Tris
        </Link>
        <Link to="/curiosita" className="lt-btn-ghost">
          o perditi nelle curiosità →
        </Link>
      </div>
    </div>
  );
}
