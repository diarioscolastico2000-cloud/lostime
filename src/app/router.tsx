import { createBrowserRouter, useParams, Link } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Layout } from './layout';
import { SearchBar } from '../features/search/SearchBar';
import { ContentCard } from '../features/search/ContentCard';
import { getHomeSections, getGiochiHub } from '../features/search/homeSections';
import { CuriosityGrid } from '../features/curiosities/CuriosityGrid';
import { CuriosityDetail } from '../features/curiosities/CuriosityDetail';
import { NotFound } from '../shared/NotFound';
import { useLocalSessions, recordRoomVisit } from '../features/sessions/useLocalSessions';
import { TicTacToeBoard } from '../features/games/tictactoe/TicTacToeBoard';
import { Lobby } from '../features/lobby/Lobby';

// Pagine pesanti in lazy: Home resta leggera, il resto si scarica alla visita.
const CieloMap = lazy(() => import('../features/cielo/CieloMap').then((m) => ({ default: m.CieloMap })));
const ChessBoard = lazy(() => import('../features/games/chess/ChessBoard').then((m) => ({ default: m.ChessBoard })));
const QuizPlayer = lazy(() => import('../features/quiz/QuizPlayer').then((m) => ({ default: m.QuizPlayer })));
const SolitaireBoard = lazy(() => import('../features/games/solitaire/SolitaireBoard').then((m) => ({ default: m.SolitaireBoard })));
const Game2048 = lazy(() => import('../features/games/v2048/Game2048').then((m) => ({ default: m.Game2048 })));

export function conSuspense(el: React.ReactElement) {
  return <Suspense fallback={<div>Caricamento…</div>}>{el}</Suspense>;
}
import { useLobby } from '../features/lobby/useLobby';
import { createLobbyCode } from '../features/lobby/lobbyApi';
import { GAMES } from '../features/games/registry';
export const APP_ROUTES = ['/', '/curiosita', '/curiosita/:id', '/cielo', '/giochi', '/giochi/solitario', '/giochi/tris', '/giochi/scacchi', '/giochi/2048', '/giochi/:gameId', '/r/:codice', '/giochi/:gameId/r/:codice', '/giochi/scacchi/r/:codice', '/sessioni'];
export function getAppRoutes(): string[] { return APP_ROUTES; }
function TrisPage() {
  const [codice] = useState(() => createLobbyCode());
  return (<div><h2>Tris</h2><TicTacToeBoard /><Lobby codice={codice} gameId="tris" maxPlayers={GAMES.tris.maxPlayers} /></div>);
}
function ChessPage() {
  const [codice] = useState(() => createLobbyCode());
  return (<div><h2>Scacchi</h2><ChessBoard /><Lobby codice={codice} gameId="scacchi" maxPlayers={GAMES.scacchi.maxPlayers} /></div>);
}
function ChessRoomPage() {
  const { codice = '' } = useParams();
  if (!codice) return (<div>Codice stanza mancante</div>);
  return (<div><Lobby codice={codice} gameId="scacchi" maxPlayers={GAMES.scacchi.maxPlayers} /><ChessBoard /></div>);
}

function HomePage() {
  const s = getHomeSections();
  return (
    <div>
      <section className="lt-hero" aria-labelledby="home-titolo">
        <span className="lt-hero-kicker">Gratis • Senza account</span>
        <h1 id="home-titolo">Perdi tempo bene</h1>
        <p className="lt-hero-sub">
          Curiosità, giochi e quiz gratis, senza account. Da 2 minuti sul divano
          o da 20 con un amico: scegli e parti.
        </p>
        <div className="lt-search-prominent">
          <SearchBar />
        </div>
        <div className="lt-hero-points" aria-label="perché LosTime">
          <span className="lt-pill">⚡ Partite da 2–5 min</span>
          <span className="lt-pill">👥 Sfide con codice stanza</span>
          <span className="lt-pill">📵 Funziona anche offline*</span>
        </div>
      </section>

      <section className="lt-section" aria-labelledby="h-due">
        <div className="lt-section-head">
          <h2 id="h-due">Giochi in 2</h2>
          <p>X contro O, matto in 20 minuti, o un disegno a catena.</p>
          <Link className="lt-section-link" to="/giochi">
            Tutti i giochi →
          </Link>
        </div>
        <div className="lt-grid">{s.giochiDue.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>

      <section className="lt-section" aria-labelledby="h-veloci">
        <div className="lt-section-head">
          <h2 id="h-veloci">5 minuti</h2>
          <p>Pausa caffè? Un quiz, un dino, un cerchio perfetto.</p>
        </div>
        <div className="lt-grid">{s.veloci.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>

      <section className="lt-section" aria-labelledby="h-live">
        <div className="lt-section-head">
          <h2 id="h-live">Esplora live</h2>
          <p>Aerei, navi, fulmini e spazio: il mondo in tempo reale.</p>
          <Link className="lt-section-link" to="/cielo">
            Apri il cielo →
          </Link>
        </div>
        <div className="lt-grid">{s.esplora.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>

      <section className="lt-section" aria-labelledby="h-cur">
        <div className="lt-section-head">
          <h2 id="h-cur">Curiosità</h2>
          <p>Il miele eterno, i polpi blu, Saturno che galleggia.</p>
          <Link className="lt-section-link" to="/curiosita">
            Vedi tutte le curiosità →
          </Link>
        </div>
        <CuriosityGrid items={s.curiosita} />
      </section>
    </div>
  );
}

function GiochiHubPage() {
  const { interni, esterni } = getGiochiHub();
  return (
    <div>
      <div className="lt-page-head">
        <h1>Giochi</h1>
        <p>
          {interni.length} giochi tuoi + {esterni.length} esterni gratis, tutti senza account.
          Le stanze a codice si ritrovano in Sessioni.
        </p>
      </div>
      <section className="lt-section" aria-labelledby="g-interni">
        <div className="lt-section-head">
          <h2 id="g-interni">I tuoi giochi</h2>
        </div>
        <div className="lt-grid">{interni.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>
      <section className="lt-section" aria-labelledby="g-esterni">
        <div className="lt-section-head">
          <h2 id="g-esterni">Giochi esterni gratis</h2>
          <p>Si aprono in una nuova scheda, niente account richiesto.</p>
        </div>
        <div className="lt-grid">{esterni.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>
    </div>
  );
}

function CuriosityDetailPage() {
  const { id = '' } = useParams();
  return <CuriosityDetail id={id} />;
}

function SessionsPage() {
  const { sessions, clear } = useLocalSessions();
  if (sessions.length === 0) {
    return (
      <div>
        <div className="lt-page-head">
          <h1>Sessioni</h1>
          <p>Nessuna stanza recente. Crea una lobby e torna qui per ritrovarla.</p>
        </div>
        <p>
          <Link className="lt-btn" to="/giochi">
            Vai ai giochi
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="lt-page-head">
        <h1>Sessioni recenti</h1>
        <p>Le tue ultime stanze su questo dispositivo. Tocca per rientrare.</p>
      </div>
      <ul className="lt-list">
        {sessions.map((s) => (
          <li key={s.codice} className="lt-list-item">
            <Link to={`/giochi/${s.gameId}/r/${s.codice}`}>{s.gameId} — {s.codice}</Link>
            <small className="lt-meta">
              {s.nickname ? `come ${s.nickname} • ` : ''}{new Date(s.ultimoAccesso).toLocaleString('it-IT')}
            </small>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 12 }}>
        <button className="lt-btn-secondary" onClick={clear}>
          Cancella storico
        </button>
      </div>
    </div>
  );
}

function RoomPage() {
  const { codice = '' } = useParams();
  const { lobby, stato } = useLobby(codice);
  const gameId = lobby?.gameId ?? 'tris';
  const maxPlayers = lobby?.maxPlayers ?? GAMES.tris.maxPlayers;
  useEffect(() => {
    if (codice) recordRoomVisit(codice, gameId);
  }, [codice, gameId]);
  if (!codice) return (<div>Codice stanza mancante</div>);
  if (stato === 'non-trovata') {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h2>Stanza {codice} non trovata 🕳️</h2>
        <p>Controlla il codice oppure creane una nuova.</p>
        <p><Link to={`/giochi/${gameId}`}>Crea nuova lobby {gameId}</Link> • <Link to="/">Home</Link></p>
      </div>
    );
  }
  if (stato === 'offline') return (<div>📡 Offline — riconnessione… lo stato arriverà alla ripresa.</div>);
  return (<div><Lobby codice={codice} gameId={gameId} maxPlayers={maxPlayers} />{gameId === 'tris' && <TicTacToeBoard />}{gameId === 'scacchi' && <ChessBoard />}</div>);
}
function GameRoomPage() {
  const { gameId = 'tris', codice = '' } = useParams();
  const maxPlayers = (gameId in GAMES ? GAMES[gameId as keyof typeof GAMES].maxPlayers : 2) as number;
  useEffect(() => {
    if (codice) recordRoomVisit(codice, gameId);
  }, [codice, gameId]);
  if (!codice) return (<div>Codice stanza mancante</div>);
  return (<div><Lobby codice={codice} gameId={gameId} maxPlayers={maxPlayers} />{gameId === 'tris' ? <TicTacToeBoard /> : gameId === 'scacchi' ? <ChessBoard /> : <p>Stanza {gameId} - lobby generica</p>}</div>);
}
export const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <HomePage /> },
    { path: 'curiosita', element: <div><div className="lt-page-head"><h1>Curiosità</h1><p>Storie brevi da raccontare a cena: scienza, natura, spazio. Tocca “Scheda” per leggere e passare alla successiva.</p></div><CuriosityGrid /></div> },
    { path: 'curiosita/:id', element: <CuriosityDetailPage /> },
    { path: 'cielo', element: conSuspense(<CieloMap />) },
    { path: 'giochi', element: <GiochiHubPage /> },
    { path: 'giochi/quiz', element: conSuspense(<QuizPlayer />) },
    { path: 'giochi/solitario', element: conSuspense(<SolitaireBoard />) },
    { path: 'giochi/tris', element: <TrisPage /> },
    { path: 'giochi/scacchi', element: conSuspense(<ChessPage />) },
    { path: 'giochi/2048', element: conSuspense(<Game2048 />) },
    { path: 'giochi/:gameId', element: <div>Gioco</div> },
    { path: 'r/:codice', element: conSuspense(<RoomPage />) },
    { path: 'giochi/:gameId/r/:codice', element: conSuspense(<GameRoomPage />) },
    { path: 'giochi/scacchi/r/:codice', element: conSuspense(<ChessRoomPage />) },
    { path: 'sessioni', element: <SessionsPage /> },
    { path: '*', element: <NotFound /> }
  ]}
]);
