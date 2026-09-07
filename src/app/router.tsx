import { createBrowserRouter, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from './layout';
import { SearchBar } from '../features/search/SearchBar';
import { CuriosityCard } from '../features/curiosities/CuriosityCard';
import curiosities from '../features/curiosities/curiosities.json';
import { QuizPlayer } from '../features/quiz/QuizPlayer';
import { CieloMap } from '../features/cielo/CieloMap';
import { SolitaireBoard } from '../features/games/solitaire/SolitaireBoard';
import { TicTacToeBoard } from '../features/games/tictactoe/TicTacToeBoard';
import { ChessBoard } from '../features/games/chess/ChessBoard';
import { Lobby } from '../features/lobby/Lobby';
import { useLobby } from '../features/lobby/useLobby';
import { createLobbyCode } from '../features/lobby/lobbyApi';
import { GAMES } from '../features/games/registry';
export const APP_ROUTES = ['/', '/curiosita', '/cielo', '/giochi', '/giochi/solitario', '/giochi/tris', '/giochi/scacchi', '/giochi/:gameId', '/r/:codice', '/giochi/:gameId/r/:codice', '/giochi/scacchi/r/:codice', '/sessioni'];
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
function RoomPage() {
  const { codice = '' } = useParams();
  const { lobby } = useLobby(codice);
  const gameId = lobby?.gameId ?? 'tris';
  const maxPlayers = lobby?.maxPlayers ?? GAMES.tris.maxPlayers;
  if (!codice) return (<div>Codice stanza mancante</div>);
  return (<div><Lobby codice={codice} gameId={gameId} maxPlayers={maxPlayers} />{gameId === 'tris' && <TicTacToeBoard />}{gameId === 'scacchi' && <ChessBoard />}</div>);
}
function GameRoomPage() {
  const { gameId = 'tris', codice = '' } = useParams();
  const maxPlayers = (gameId in GAMES ? GAMES[gameId as keyof typeof GAMES].maxPlayers : 2) as number;
  if (!codice) return (<div>Codice stanza mancante</div>);
  return (<div><Lobby codice={codice} gameId={gameId} maxPlayers={maxPlayers} />{gameId === 'tris' ? <TicTacToeBoard /> : gameId === 'scacchi' ? <ChessBoard /> : <p>Stanza {gameId} - lobby generica</p>}</div>);
}
export const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <div>Home LosTime<SearchBar /></div> },
    { path: 'curiosita', element: <div style={{ display: 'grid', gap: 16 }}>{(curiosities as { id: string, titolo: string, descrizione: string, link: string }[]).map(c => <CuriosityCard key={c.id} titolo={c.titolo} descrizione={c.descrizione} link={c.link} />)}</div> },
    { path: 'cielo', element: <CieloMap /> },
    { path: 'giochi', element: <div>Giochi</div> },
    { path: 'giochi/quiz', element: <QuizPlayer /> },
    { path: 'giochi/solitario', element: <SolitaireBoard /> },
    { path: 'giochi/tris', element: <TrisPage /> },
    { path: 'giochi/scacchi', element: <ChessPage /> },
    { path: 'giochi/:gameId', element: <div>Gioco</div> },
    { path: 'r/:codice', element: <RoomPage /> },
    { path: 'giochi/:gameId/r/:codice', element: <GameRoomPage /> },
    { path: 'giochi/scacchi/r/:codice', element: <ChessRoomPage /> },
    { path: 'sessioni', element: <div>Sessioni futuro</div> },
    { path: '*', element: <div>404 giocosa - torna a casa</div> }
  ]}
]);
