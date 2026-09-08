import { useState } from 'react';
import { validateNickname } from './lobbyApi';
import { useLobby } from './useLobby';
const FASE_STYLE: Record<string, React.CSSProperties> = {
  'attesa': { background: '#fef3c7', color: '#92400e', border: '2px solid #f59e0b' },
  'in-gioco': { background: '#dcfce7', color: '#166534', border: '2px solid #22c55e' },
  'finita': { background: '#e5e7eb', color: '#374151', border: '2px solid #9ca3af' },
};
export function Lobby({ codice, gameId, maxPlayers }: { codice: string, gameId: string, maxPlayers: number }) {
  const [nick, setNick] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('lostime-nick') : null) ?? '');
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const { lobby, stato: conn } = useLobby(codice);
  const link = `${typeof location !== 'undefined' ? location.origin : ''}/r/${codice}`;
  const fase = lobby?.stato ?? 'attesa';
  const players = lobby?.giocatori ?? [];
  const dispGame = lobby?.gameId ?? gameId;
  const dispMax = lobby?.maxPlayers ?? maxPlayers;
  const myNick = nick.trim();
  const turnNick = players.length > 0 ? players[0].nickname : (joined ? myNick : '');
  const myTurn = !!myNick && !!turnNick && myNick === turnNick && fase === 'in-gioco';
  async function copia() {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(link);
      else {
        const ta = document.createElement('textarea');
        ta.value = link; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  }
  if (!joined) return (<div><h2>Lobby {codice} - {dispGame}</h2><input aria-label="nickname" value={nick} onChange={e => setNick(e.target.value)} placeholder="Nickname" /><button disabled={!validateNickname(nick)} onClick={() => { localStorage.setItem('lostime-nick', nick.trim()); setJoined(true); }}>Entra ({dispMax} max)</button></div>);
  return (
    <div>
      <div data-testid="lobby-fase" style={{ padding: 12, borderRadius: 8, fontWeight: 700, ...FASE_STYLE[fase] }}>
        {fase === 'attesa' ? `⏳ In attesa di giocatori (${players.length}/${dispMax})` : fase === 'in-gioco' ? '🎮 Partita in corso' : '🏁 Partita finita'}
      </div>
      {conn !== 'pronta' && <p data-testid="lobby-conn" style={{ fontSize: 12, opacity: 0.7 }}>Connessione: {conn} — dati live in arrivo…</p>}
      <p>Sei dentro come {nick} — Lobby {codice} ({dispGame})</p>
      {turnNick && <p data-testid="lobby-turno" style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontWeight: 700, background: myTurn ? '#22c55e' : '#e0e7ff', color: myTurn ? '#fff' : '#3730a9' }}>{myTurn ? '🟢 Tocca a te!' : `Turno di ${turnNick}`}</p>}
      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={copia} style={{ fontSize: 18, padding: '14px 20px', fontWeight: 700, cursor: 'pointer' }}>{copied ? '✅ Link copiato!' : '🔗 Copia link invito'}</button>
        <p style={{ fontSize: 13, wordBreak: 'break-all' }}>{link}</p>
      </div>
      {players.length > 0 && <ul data-testid="lobby-players">{players.map(p => <li key={p.ordine}>{p.nickname}{p.nickname === turnNick ? ' — 🎯 turno' : ''}</li>)}</ul>}
    </div>
  );
}
