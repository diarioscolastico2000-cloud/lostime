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

export function conSuspense(el: React.ReactElement) {
  return <Suspense fallback={<div>Caricamento…</div>}>{el}</Suspense>;
}
import { useLobby } from '../features/lobby/useLobby';
import { createLobbyCode } from '../features/lobby/lobbyApi';
import { GAMES } from '../features/games/registry';
export const APP_ROUTES = ['/', '/curiosita', '/curiosita/:id', '/cielo', '/giochi', '/giochi/solitario', '/giochi/tris', '/giochi/scacchi', '/giochi/:gameId', '/r/:codice', '/giochi/:gameId/r/:codice', '/giochi/scacchi/r/:codice', '/sessioni'];
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
const gridStyle = {
  display: 'grid', gap: 12,
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
} as const;

function HomePage() {
  const s = getHomeSections();
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section>
        <h1>Perdi tempo bene</h1>
        <p>Curiosità, giochi e quiz gratis, senza account.</p>
        <SearchBar />
      </section>
      <section>
        <h2>Giochi in 2</h2>
        <div style={gridStyle}>{s.giochiDue.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>
      <section>
        <h2>5 minuti</h2>
        <div style={gridStyle}>{s.veloci.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>
      <section>
        <h2>Esplora live</h2>
        <div style={gridStyle}>{s.esplora.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>
      <section>
        <h2>Curiosità</h2>
        <CuriosityGrid items={s.curiosita} />
        <p><Link to="/curiosita">Vedi tutte le curiosità</Link></p>
      </section>
    </div>
  );
}

function GiochiHubPage() {
  const { interni, esterni } = getGiochiHub();
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h1>Giochi</h1>
      <section>
        <h2>I tuoi giochi</h2>
        <div style={gridStyle}>{interni.map((c) => <ContentCard key={c.id} item={c} />)}</div>
      </section>
      <section>
        <h2>Giochi esterni gratis</h2>
        <div style={gridStyle}>{esterni.map((c) => <ContentCard key={c.id} item={c} />)}</div>
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
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>Sessioni</h1>
        <p>Nessuna stanza recente. Crea una lobby e torna qui per ritrovarla.</p>
        <p><Link to="/giochi">Vai ai giochi</Link></p>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h1>Sessioni recenti</h1>
      <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
        {sessions.map((s) => (
          <li key={s.codice} style={{ borderRadius: 12, padding: 12, background: '#1e1e2a' }}>
            <Link to={`/giochi/${s.gameId}/r/${s.codice}`}>{s.gameId} — {s.codice}</Link>
            <div style={{ opacity: 0.7, fontSize: 14 }}>
              {s.nickname ? `come ${s.nickname} • ` : ''}{new Date(s.ultimoAccesso).toLocaleString('it-IT')}
            </div>
          </li>
        ))}
      </ul>
      <div><button style={{ minHeight: 44, borderRadius: 12 }} onClick={clear}>Cancella storico</button></div>
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
    { path: 'curiosita', element: <div style={{ display: 'grid', gap: 16 }}><h1>Curiosità</h1><CuriosityGrid /></div> },
    { path: 'curiosita/:id', element: <CuriosityDetailPage /> },
    { path: 'cielo', element: conSuspense(<CieloMap />) },
    { path: 'giochi', element: <GiochiHubPage /> },
    { path: 'giochi/quiz', element: conSuspense(<QuizPlayer />) },
    { path: 'giochi/solitario', element: conSuspense(<SolitaireBoard />) },
    { path: 'giochi/tris', element: <TrisPage /> },
    { path: 'giochi/scacchi', element: conSuspense(<ChessPage />) },
    { path: 'giochi/:gameId', element: <div>Gioco</div> },
    { path: 'r/:codice', element: conSuspense(<RoomPage />) },
    { path: 'giochi/:gameId/r/:codice', element: conSuspense(<GameRoomPage />) },
    { path: 'giochi/scacchi/r/:codice', element: conSuspense(<ChessRoomPage />) },
    { path: 'sessioni', element: <SessionsPage /> },
    { path: '*', element: <NotFound /> }
  ]}
]);
