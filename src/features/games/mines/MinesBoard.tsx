import { useEffect, useRef, useState } from 'react';
import {
  countBandiere,
  createBoard,
  isLost,
  isWon,
  openCell,
  toggleFlag,
  type Board,
  type Pos,
} from './engineMines';

type LivelloId = 'facile' | 'medio' | 'difficile';

type Livello = {
  id: LivelloId;
  nome: string;
  righe: number;
  cols: number;
  mine: number;
};

const LIVELLI: Livello[] = [
  { id: 'facile', nome: 'Facile 9×9 · 10 mine', righe: 9, cols: 9, mine: 10 },
  { id: 'medio', nome: 'Medio 16×16 · 40 mine', righe: 16, cols: 16, mine: 40 },
  { id: 'difficile', nome: 'Difficile 16×30 · 99 mine', righe: 16, cols: 30, mine: 99 },
];

const BEST_KEY = 'lostime:mines:best';
const LONG_PRESS_MS = 450;

type BestMap = Record<LivelloId, number | null>;

function loadBest(): BestMap {
  const fallback: BestMap = { facile: null, medio: null, difficile: null };
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as Partial<Record<LivelloId, unknown>>;
    const out: BestMap = { ...fallback };
    for (const l of LIVELLI) {
      const v = parsed[l.id];
      out[l.id] = typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : null;
    }
    return out;
  } catch {
    return fallback;
  }
}

function saveBest(map: BestMap): void {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(map));
  } catch {
    /* storage non disponibile: il record resta solo in memoria */
  }
}

const NUMERI_COLORI: Record<number, string> = {
  1: '#1976d2',
  2: '#388e3c',
  3: '#d32f2f',
  4: '#7b1fa2',
  5: '#b71c1c',
  6: '#00838f',
  7: '#212121',
  8: '#616161',
};

function formatTempo(s: number): string {
  return `${s}s`;
}

/** Campo Minato interno, offline: tap/click per aprire, tasto destro o long-press per bandiera. */
export function MinesBoard() {
  const [livelloId, setLivelloId] = useState<LivelloId>('facile');
  const livello = LIVELLI.find((l) => l.id === livelloId) ?? LIVELLI[0];
  // null = mine non ancora piazzate: si piazzano alla prima apertura (sempre sicura).
  const [board, setBoard] = useState<Board | null>(null);
  const [secondi, setSecondi] = useState(0);
  const [best, setBest] = useState<BestMap>(loadBest);
  const [bestSaved, setBestSaved] = useState(false);

  const perso = board != null && isLost(board);
  const vinto = board != null && !perso && isWon(board);
  const finito = vinto || perso;
  const iniziato = board != null;
  const bandiere = board ? countBandiere(board) : 0;
  const rimanenti = livello.mine - bandiere;
  const bestLivello = best[livello.id];

  // Timer: parte alla prima apertura, si ferma a vittoria/sconfitta.
  useEffect(() => {
    if (!iniziato || finito) return;
    const t = window.setInterval(() => setSecondi((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [iniziato, finito, livelloId]);

  // Record salvato una sola volta per vittoria.
  useEffect(() => {
    if (!vinto || bestSaved) return;
    setBest((prev) => {
      const cur = prev[livello.id];
      if (cur != null && cur <= secondi) return prev;
      const next = { ...prev, [livello.id]: secondi };
      saveBest(next);
      return next;
    });
    setBestSaved(true);
  }, [vinto, bestSaved, secondi, livello.id]);

  function nuovaPartita(): void {
    setBoard(null);
    setSecondi(0);
    setBestSaved(false);
  }

  function cambiaLivello(id: LivelloId): void {
    setLivelloId(id);
    setBoard(null);
    setSecondi(0);
    setBestSaved(false);
  }

  function apri(pos: Pos): void {
    if (finito) return;
    if (board == null) {
      // Prima apertura: piazzo le mine escludendo la cella cliccata + vicini.
      const fresh = createBoard(livello.righe, livello.cols, livello.mine, pos);
      setBoard(openCell(fresh, pos.r, pos.c));
      setSecondi(0);
      setBestSaved(false);
      return;
    }
    setBoard(openCell(board, pos.r, pos.c));
  }

  function bandiera(pos: Pos): void {
    if (finito || board == null) return;
    setBoard(toggleFlag(board, pos.r, pos.c));
  }

  const status = vinto
    ? `Hai vinto in ${formatTempo(secondi)}! Rigioca o cambia livello.`
    : perso
      ? 'Boom! Hai preso una mina. Rigioca per riprovare.'
      : iniziato
        ? `Mine rimaste: ${rimanenti}. Tocca per aprire, tasto destro o pressione lunga per la bandiera.`
        : 'Apri una cella per iniziare: la prima è sempre sicura.';

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
      <div>
        <h2 style={{ margin: 0 }}>Campo Minato</h2>
        <p style={{ margin: '4px 0 0' }}>Trova tutte le caselle sicure senza toccare le mine. Giocabile offline.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Livello di difficoltà">
        {LIVELLI.map((l) => (
          <button
            key={l.id}
            type="button"
            className={l.id === livello.id ? 'lt-btn' : 'lt-btn-secondary'}
            data-testid={`mines-livello-${l.id}`}
            aria-pressed={l.id === livello.id}
            onClick={() => cambiaLivello(l.id)}
          >
            {l.nome}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div data-testid="mines-rimanenti" aria-label={`Mine rimaste ${rimanenti}`} style={scoreBox}>
          <small style={scoreLabel}>MINE</small>
          <strong style={scoreValue}>
            🚩 {bandiere}/{livello.mine}
          </strong>
        </div>
        <div data-testid="mines-tempo" aria-label={`Tempo ${secondi} secondi`} style={scoreBox}>
          <small style={scoreLabel}>TEMPO</small>
          <strong style={scoreValue}>⏱ {secondi}s</strong>
        </div>
        <div data-testid="mines-best" aria-label={bestLivello == null ? 'Nessun record per questo livello' : `Record ${bestLivello} secondi`} style={scoreBox}>
          <small style={scoreLabel}>RECORD</small>
          <strong style={scoreValue}>{bestLivello == null ? '—' : `${bestLivello}s`}</strong>
        </div>
        <div style={{ display: 'grid', gap: 8, marginLeft: 'auto' }}>
          <button type="button" className="lt-btn-secondary" data-testid="mines-nuova" onClick={nuovaPartita}>
            ↺ {iniziato ? 'Rigioca' : 'Nuova partita'}
          </button>
        </div>
      </div>

      <p data-testid="mines-status" aria-live="polite" style={{ margin: 0 }}>
        {status}
      </p>

      {vinto && (
        <div data-testid="mines-win" role="status" style={bannerWin}>
          <strong>🎉 Campo ripulito in {formatTempo(secondi)}!</strong>
          <span>
            Livello {livello.nome}
            {bestLivello != null ? ` • Record ${formatTempo(bestLivello)}` : ''}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="lt-btn" onClick={nuovaPartita}>
              Rigioca
            </button>
          </div>
        </div>
      )}

      {perso && (
        <div data-testid="mines-over" role="alert" style={bannerLose}>
          <strong>💥 Boom — mina esplosa dopo {formatTempo(secondi)}.</strong>
          <span>Le mine sono rivelate. Riprova, la prima cella è sempre sicura.</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="lt-btn" onClick={nuovaPartita}>
              Rigioca
            </button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <div
          data-testid="mines-grid"
          role="grid"
          aria-label={`Campo minato ${livello.righe} per ${livello.cols}, ${livello.mine} mine`}
          style={{ ...boardStyle, gridTemplateColumns: `repeat(${livello.cols}, minmax(26px, 32px))` }}
        >
          {Array.from({ length: livello.righe }, (_, r) =>
            Array.from({ length: livello.cols }, (_, c) => (
              <MineCell
                key={`${r}-${c}`}
                board={board}
                r={r}
                c={c}
                rivelata={finito}
                onOpen={() => apri({ r, c })}
                onFlag={() => bandiera({ r, c })}
              />
            )),
          )}
        </div>
      </div>

      <p style={{ margin: 0 }}>
        <small className="lt-meta">
          Click o tap per aprire, tasto destro o pressione lunga (mezzo secondo) per 🚩.
          La prima apertura non è mai una mina. Il record per livello resta su questo dispositivo.
        </small>
      </p>
    </div>
  );
}

function MineCell(props: {
  board: Board | null;
  r: number;
  c: number;
  rivelata: boolean;
  onOpen: () => void;
  onFlag: () => void;
}) {
  const { board, r, c, rivelata, onOpen, onFlag } = props;
  const cell = board?.[r]?.[c];
  const aperta = cell?.aperta ?? false;
  const bandiera = cell?.bandiera ?? false;
  const mina = cell?.mina ?? false;
  const adiacenti = cell?.adiacenti ?? 0;

  // A partita persa rivelo le mine; le bandiere sbagliate si marcano ❌.
  const mostraMina = aperta && mina;
  const minaRivelata = rivelata && mina && !bandiera && !aperta;
  const bandieraSbagliata = rivelata && bandiera && !mina;

  const contenuto = aperta
    ? mostraMina
      ? '💥'
      : adiacenti > 0
        ? String(adiacenti)
        : ''
    : bandiera
      ? bandieraSbagliata
        ? '❌'
        : '🚩'
      : minaRivelata
        ? '💣'
        : '';

  const label = aperta
    ? mostraMina
      ? `mina esplosa in riga ${r + 1} colonna ${c + 1}`
      : adiacenti > 0
        ? `${adiacenti} mine vicine in riga ${r + 1} colonna ${c + 1}`
        : `casella vuota in riga ${r + 1} colonna ${c + 1}`
    : bandiera
      ? `bandiera in riga ${r + 1} colonna ${c + 1}`
      : `casella coperta in riga ${r + 1} colonna ${c + 1}`;

  const pressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  useEffect(() => {
    return () => {
      if (pressTimer.current != null) window.clearTimeout(pressTimer.current);
    };
  }, []);

  function cancelPress(): void {
    if (pressTimer.current != null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={label}
      data-testid={`mines-cell-${r}-${c}`}
      onClick={() => {
        // Dopo un long-press il tap di rilascio non deve anche aprire.
        if (longPressFired.current) {
          longPressFired.current = false;
          return;
        }
        onOpen();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onFlag();
      }}
      onTouchStart={() => {
        longPressFired.current = false;
        cancelPress();
        pressTimer.current = window.setTimeout(() => {
          longPressFired.current = true;
          pressTimer.current = null;
          onFlag();
          try {
            navigator.vibrate?.(30);
          } catch {
            /* vibrazione non disponibile */
          }
        }, LONG_PRESS_MS);
      }}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      style={{
        ...cellStyle,
        background: aperta ? (mostraMina ? '#e53935' : '#e8e0d5') : '#9d917f',
        color: aperta && adiacenti > 0 ? (NUMERI_COLORI[adiacenti] ?? '#212121') : '#212121',
        cursor: aperta ? 'default' : 'pointer',
      }}
    >
      {contenuto}
    </button>
  );
}

const scoreBox: React.CSSProperties = {
  background: '#bbada0',
  color: '#fff',
  borderRadius: 8,
  padding: '6px 14px',
  minWidth: 86,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const scoreLabel: React.CSSProperties = { fontSize: 11, letterSpacing: 1, opacity: 0.9 };

const scoreValue: React.CSSProperties = { fontSize: 20, lineHeight: 1.1 };

const bannerWin: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  border: '2px solid #388e3c',
  borderRadius: 10,
  padding: 12,
  background: '#e8f5e9',
  color: '#1b5e20',
};

const bannerLose: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  border: '2px solid #e53935',
  borderRadius: 10,
  padding: 12,
  background: '#ffebee',
  color: '#b71c1c',
};

const boardStyle: React.CSSProperties = {
  display: 'grid',
  gap: 3,
  background: '#bbada0',
  borderRadius: 10,
  padding: 6,
  touchAction: 'pan-x pan-y',
  userSelect: 'none',
  width: 'max-content',
};

const cellStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1',
  minWidth: 26,
  minHeight: 26,
  border: 'none',
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 15,
  lineHeight: 1,
  padding: 0,
};
