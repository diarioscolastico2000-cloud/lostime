import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MAX_TENTATIVI,
  WORD_LEN,
  evaluateGuess,
  getKeyStates,
  isValidWord,
  isWinningGuess,
  stateToEmoji,
  type LetterState,
} from './engineWordle';
import { WORDS, normalizeWord, pickDaily, pickRandom } from './words';

type Modo = 'giornaliera' | 'casuale';

type Stats = { giocate: number; vinte: number; streak: number };

const STATS_KEY = 'lostime:wordle:stats';

function loadStats(): Stats {
  const fallback: Stats = { giocate: 0, vinte: 0, streak: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw == null) return fallback;
    const p = JSON.parse(raw) as Partial<Stats>;
    return {
      giocate: typeof p.giocate === 'number' && p.giocate >= 0 ? Math.floor(p.giocate) : 0,
      vinte: typeof p.vinte === 'number' && p.vinte >= 0 ? Math.floor(p.vinte) : 0,
      streak: typeof p.streak === 'number' && p.streak >= 0 ? Math.floor(p.streak) : 0,
    };
  } catch {
    return fallback;
  }
}

function saveStats(s: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    /* storage non disponibile */
  }
}

const RIGHE_TASTIERA = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

const COLORE: Record<LetterState | 'empty' | 'current', string> = {
  correct: '#538d4e',
  present: '#c9b458',
  absent: '#787c7e',
  empty: '#ffffff',
  current: '#ffffff',
};

const FG: Record<LetterState | 'empty' | 'current', string> = {
  correct: '#ffffff',
  present: '#ffffff',
  absent: '#ffffff',
  empty: '#1a1a1a',
  current: '#1a1a1a',
};

const MESSAGGI_VITTORIA = [
  'Geniale! 🎉',
  'Fantastico! 🎉',
  'Bravo! 👏',
  'Ben fatto! 👍',
  'Phew, al pelo! 😅',
  'Al sesto tentativo! 🍀',
];

/** Wordle italiano interno, offline: parola del giorno + modalità casuale. */
export function WordleBoard() {
  const [modo, setModo] = useState<Modo>('giornaliera');
  const [soluzione, setSoluzione] = useState<string>(() => pickDaily());
  const [tentativi, setTentativi] = useState<string[]>([]);
  const [corrente, setCorrente] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [condiviso, setCondiviso] = useState(false);
  const contabilizzato = useRef(false);

  const vinto = tentativi.some((t) => isWinningGuess(soluzione, t));
  const perso = !vinto && tentativi.length >= MAX_TENTATIVI;
  const finito = vinto || perso;

  const statiTastiera = useMemo(() => getKeyStates(tentativi, soluzione), [tentativi, soluzione]);

  // Le statistiche si contabilizzano una sola volta per partita.
  useEffect(() => {
    if (!finito || contabilizzato.current) return;
    contabilizzato.current = true;
    setStats((prev) => {
      const next: Stats = {
        giocate: prev.giocate + 1,
        vinte: prev.vinte + (vinto ? 1 : 0),
        streak: vinto ? prev.streak + 1 : 0,
      };
      saveStats(next);
      return next;
    });
  }, [finito, vinto]);

  function nuovaPartita(m: Modo): void {
    contabilizzato.current = false;
    setTentativi([]);
    setCorrente('');
    setErrore(null);
    setCondiviso(false);
    if (m === 'casuale') {
      let next = pickRandom();
      if (WORDS.length > 1) {
        for (let i = 0; i < 5 && next === soluzione; i++) next = pickRandom();
      }
      setSoluzione(next);
    } else {
      setSoluzione(pickDaily());
    }
  }

  function cambiaModo(m: Modo): void {
    if (m === modo) {
      nuovaPartita(m);
      return;
    }
    setModo(m);
    contabilizzato.current = false;
    setTentativi([]);
    setCorrente('');
    setErrore(null);
    setCondiviso(false);
    setSoluzione(m === 'giornaliera' ? pickDaily() : pickRandom());
  }

  function invia(): void {
    if (finito) return;
    const w = normalizeWord(corrente);
    if (w.length !== WORD_LEN) {
      setErrore(`Scrivi ${WORD_LEN} lettere.`);
      return;
    }
    if (!isValidWord(w)) {
      setErrore('Parola non in lista.');
      return;
    }
    setErrore(null);
    setTentativi((prev) => [...prev, w]);
    setCorrente('');
    setCondiviso(false);
  }

  function premiTasto(t: string): void {
    if (finito) return;
    if (t === 'ENTER') {
      invia();
      return;
    }
    if (t === 'BACK') {
      setCorrente((c) => c.slice(0, -1));
      return;
    }
    if (/^[A-Z]$/.test(t) && corrente.length < WORD_LEN) {
      setCorrente((c) => (c.length >= WORD_LEN ? c : c + t));
      setErrore(null);
    }
  }

  // Tastiera fisica: lettere, Invio, Backspace.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        invia();
      } else if (e.key === 'Backspace') {
        setCorrente((c) => c.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const L = normalizeWord(e.key);
        setCorrente((c) => (c.length >= WORD_LEN ? c : c + L));
        setErrore(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finito, corrente, tentativi, soluzione]);

  function testoCondivisione(): string {
    const righe = tentativi.map((t) =>
      evaluateGuess(soluzione, t).map(stateToEmoji).join(''),
    );
    return `LosTime Wordle IT ${vinto ? tentativi.length : 'X'}/${MAX_TENTATIVI} (${modo})\n${righe.join('\n')}`;
  }

  async function condividi(): Promise<void> {
    const testo = testoCondivisione();
    try {
      await navigator.clipboard.writeText(testo);
      setCondiviso(true);
    } catch {
      // Fallback: textarea nascosta per browser senza Clipboard API.
      try {
        const ta = document.createElement('textarea');
        ta.value = testo;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCondiviso(true);
      } catch {
        setErrore('Copia non riuscita: seleziona il risultato a mano.');
      }
    }
  }

  const status = vinto
    ? `${MESSAGGI_VITTORIA[Math.min(tentativi.length - 1, MESSAGGI_VITTORIA.length - 1)]} Soluzione ${soluzione} in ${tentativi.length}/${MAX_TENTATIVI}.`
    : perso
      ? `Peccato! La parola era ${soluzione}. Riprova.`
      : tentativi.length === 0 && corrente === ''
        ? `Indovina la parola di ${WORD_LEN} lettere in ${MAX_TENTATIVI} tentativi.`
        : `Tentativo ${tentativi.length + 1}/${MAX_TENTATIVI}.`;

  const righe: (string | null)[] = Array.from({ length: MAX_TENTATIVI }, (_, i) => {
    if (i < tentativi.length) return tentativi[i];
    if (i === tentativi.length) return corrente.padEnd(WORD_LEN, ' ');
    return null;
  });

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 440, margin: '0 auto' }}>
      <div>
        <h2 style={{ margin: 0 }}>Parola del giorno 🇮🇹</h2>
        <p style={{ margin: '4px 0 0' }}>
          Wordle italiano offline: {MAX_TENTATIVI} tentativi, {WORDS.length} parole da 5 lettere.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Modalità di gioco">
        {(['giornaliera', 'casuale'] as Modo[]).map((m) => (
          <button
            key={m}
            type="button"
            className={m === modo ? 'lt-btn' : 'lt-btn-secondary'}
            data-testid={`wordle-modo-${m}`}
            aria-pressed={m === modo}
            onClick={() => cambiaModo(m)}
          >
            {m === 'giornaliera' ? '📅 Giornaliera' : '🎲 Casuale'}
          </button>
        ))}
        <button
          type="button"
          className="lt-btn-secondary"
          data-testid="wordle-rigioca"
          onClick={() => nuovaPartita(modo)}
        >
          ↺ Rigioca
        </button>
      </div>

      <p data-testid="wordle-stats" className="lt-meta" style={{ margin: 0 }}>
        Giocate {stats.giocate} • Vinte {stats.vinte} • Serie {stats.streak}
      </p>

      <p data-testid="wordle-status" aria-live="polite" style={{ margin: 0 }}>
        {status}
      </p>

      {errore && (
        <p data-testid="wordle-errore" role="alert" style={{ margin: 0, color: '#c0392b' }}>
          ⚠️ {errore}
        </p>
      )}

      <div data-testid="wordle-grid" role="grid" aria-label="Griglia Wordle 6 per 5" style={griglia}>
        {righe.map((riga, r) => {
          const inviata = r < tentativi.length;
          const stati = riga != null && inviata ? evaluateGuess(soluzione, riga.trim()) : null;
          return (
            <div key={r} role="row" data-testid={`wordle-row-${r}`} style={rigaStile}>
              {Array.from({ length: WORD_LEN }, (_, c) => {
                const ch = riga == null ? '' : (riga[c] ?? '').trim();
                const st: LetterState | 'empty' | 'current' = stati
                  ? stati[c]
                  : ch
                    ? 'current'
                    : 'empty';
                const isCorrente = !inviata && r === tentativi.length;
                return (
                  <div
                    key={c}
                    role="gridcell"
                    aria-label={ch ? `Lettera ${ch}` : 'vuota'}
                    data-testid={`wordle-cell-${r}-${c}`}
                    data-state={st}
                    style={{
                      ...cella,
                      background: COLORE[st],
                      color: FG[st],
                      borderColor: isCorrente && ch ? '#666' : '#ccc',
                    }}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {finito && (
        <div
          data-testid={vinto ? 'wordle-win' : 'wordle-over'}
          role={vinto ? 'status' : 'alert'}
          style={vinto ? bannerWin : bannerLose}
        >
          <strong>
            {vinto
              ? `${MESSAGGI_VITTORIA[Math.min(tentativi.length - 1, MESSAGGI_VITTORIA.length - 1)]} (${soluzione})`
              : `La parola era ${soluzione}.`}
          </strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="lt-btn" onClick={() => nuovaPartita(modo)}>
              Rigioca
            </button>
            <button type="button" className="lt-btn-secondary" onClick={condividi}>
              📋 Condividi
            </button>
          </div>
          {condiviso && <small>Copiato! Incollalo dove vuoi. 📋</small>}
        </div>
      )}

      <div data-testid="wordle-keyboard" role="group" aria-label="Tastiera a schermo" style={{ display: 'grid', gap: 6 }}>
        {RIGHE_TASTIERA.map((riga, i) => (
          <div key={riga} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {i === 2 && (
              <button
                type="button"
                className="lt-btn-secondary"
                data-testid="wordle-key-ENTER"
                aria-label="Invio"
                onClick={() => premiTasto('ENTER')}
                style={tasto}
              >
                ⏎
              </button>
            )}
            {riga.split('').map((L) => {
              const st = statiTastiera[L];
              return (
                <button
                  key={L}
                  type="button"
                  data-testid={`wordle-key-${L}`}
                  data-state={st ?? 'none'}
                  aria-label={`Lettera ${L}${st ? `, ${st}` : ''}`}
                  onClick={() => premiTasto(L)}
                  style={{
                    ...tasto,
                    background: st ? COLORE[st] : '#d3d6da',
                    color: st ? '#fff' : '#1a1a1a',
                  }}
                >
                  {L}
                </button>
              );
            })}
            {i === 2 && (
              <button
                type="button"
                className="lt-btn-secondary"
                data-testid="wordle-key-BACK"
                aria-label="Cancella"
                onClick={() => premiTasto('BACK')}
                style={tasto}
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      <p style={{ margin: 0 }}>
        <small className="lt-meta">
          Tastiera fisica o a schermo. Verde = giusta al posto giusto, giallo = presente altrove,
          grigio = assente. Statistiche solo su questo dispositivo.
        </small>
      </p>
    </div>
  );
}

const griglia: React.CSSProperties = {
  display: 'grid',
  gap: 6,
};

const rigaStile: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 6,
};

const cella: React.CSSProperties = {
  aspectRatio: '1',
  border: '2px solid #ccc',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 28,
  textTransform: 'uppercase',
  userSelect: 'none',
};

const tasto: React.CSSProperties = {
  minWidth: 30,
  height: 44,
  border: 'none',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  padding: '0 6px',
};

const bannerWin: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  border: '2px solid #538d4e',
  borderRadius: 10,
  padding: 12,
  background: '#e8f5e9',
  color: '#1b5e20',
};

const bannerLose: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  border: '2px solid #787c7e',
  borderRadius: 10,
  padding: 12,
  background: '#f2f2f2',
  color: '#333',
};
