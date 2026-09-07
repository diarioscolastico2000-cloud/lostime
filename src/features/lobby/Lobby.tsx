import { useState } from 'react';
import { validateNickname } from './lobbyApi';
export function Lobby({ codice, gameId, maxPlayers }: { codice: string, gameId: string, maxPlayers: number }) {
  const [nick, setNick] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('lostime-nick') : null) ?? '');
  const [joined, setJoined] = useState(false);
  const link = `${typeof location !== 'undefined' ? location.origin : ''}/r/${codice}`;
  if (!joined) return (<div><h2>Lobby {codice} - {gameId}</h2><input aria-label="nickname" value={nick} onChange={e => setNick(e.target.value)} placeholder="Nickname" /><button disabled={!validateNickname(nick)} onClick={() => { localStorage.setItem('lostime-nick', nick.trim()); setJoined(true); }}>Entra ({maxPlayers} max)</button></div>);
  return (<div><p>Sei dentro come {nick}</p><button onClick={() => navigator.clipboard.writeText(link)}>Copia link {link}</button></div>);
}
