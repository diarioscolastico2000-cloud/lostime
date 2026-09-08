import { useEffect, useRef, useState } from 'react';
import {
  initialGrid,
  isOver,
  isWon,
  move,
  spawnRandom,
  type Direction,
  type Grid,
} from './engine2048';

const BEST_KEY = 'lostime:2048:best';
const SWIPE_MIN_PX = 24;

function loadBest(): number {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const n = raw == null ? NaN : Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function saveBest(v: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* storage non disponibile: il record resta solo in memoria */
  }
}

const CELL_BG: Record<number, string> = {
  0: '#cdc1b4',
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
};

function cellBg(v: number): string {
  return CELL_BG[v] ?? '#3c3a32';
}

function cellFg(v: number): string {
  return v <= 4 ? '#776e65' : '#f9f6f2';
}

function cellFont(v: number): number {
  if (v < 100) return 30;
  if (v < 1000) return 25;
  if (v < 10000) return 20;
  return 17;
}

type Prev = { grid: Grid; score: number };

/** 2048 interno, offline: frecce/WASD + swipe, record locale, undo singola. */
export function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => initialGrid());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(loadBest);
  const [prev, setPrev] = useState<Prev | null>(null);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [winOpen, setWinOpen] = useState(false);

  // Specchio sincrono dello stato: i listener globali leggono sempre valori freschi.
  const live = useRef({ grid, score, best, prev, over, won });
  live.current = { grid, score, best, prev, over, won };

  function newGame(): void {
    setGrid(initialGrid());
    setScore(0);
    setPrev(null);
    setOver(false);
    setWon(false);
    setWinOpen(false);
  }

  function undo(): void {
    const s = live.current;
    if (!s.prev) return;
    setGrid(s.prev.grid);
    setScore(s.prev.score);
    setPrev(null);
    setOver(isOver(s.prev.grid));
  }

  function applyMove(dir: Direction): void {
    const s = live.current;
    if (s.over) return;
    const res = move(s.grid, dir);
    if (!res.moved) return;
    const next = spawnRandom(res.grid);
    const nextScore = s.score + res.gained;
    setPrev({ grid: s.grid, score: s.score });
    setGrid(next);
    setScore(nextScore);
    if (nextScore > s.best) {
      setBest(nextScore);
      saveBest(nextScore);
    }
    if (!s.won && isWon(next)) {
      setWon(true);
      setWinOpen(true);
    }
    if (isOver(next)) setOver(true);
  }

  // La callback fresca va in un ref: il listener tastiera si registra una sola volta.
  const applyRef = useRef(applyMove);
  applyRef.current = applyMove;

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const k = e.key;
      let dir: Direction | null = null;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') dir = 'up';
      else if (k === 'ArrowDown' || k === 's' || k === 'S') dir = 'down';
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') dir = 'left';
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') dir = 'right';
      if (!dir) return;
      e.preventDefault();
      applyRef.current(dir);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: React.TouchEvent): void {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent): void {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;
    if (Math.abs(dx) > Math.abs(dy)) applyMove(dx > 0 ? 'right' : 'left');
    else applyMove(dy > 0 ? 'down' : 'up');
  }

  const status = over
    ? `Partita finita! Punteggio ${score}, record ${best}.`
    : winOpen
      ? 'Hai raggiunto 2048! Puoi continuare o rigiocare.'
      : `Punteggio ${score}, record ${best}. Frecce, WASD o swipe per muovere.`;

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 440 }}>
      <div>
        <h2 style={{ margin: 0 }}>2048</h2>
        <p style={{ margin: '4px 0 0' }}>Unisci i numeri uguali fino a 2048. Giocabile offline.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <div
          data-testid="g2048-score"
          aria-label={`Punteggio ${score}`}
          style={scoreBox}
        >
          <small style={scoreLabel}>PUNTI</small>
          <strong style={scoreValue}>{score}</strong>
        </div>
        <div
          data-testid="g2048-best"
          aria-label={`Record ${best}`}
          style={scoreBox}
        >
          <small style={scoreLabel}>RECORD</small>
          <strong style={scoreValue}>{best}</strong>
        </div>
        <div style={{ display: 'grid', gap: 8, marginLeft: 'auto' }}>
          <button type="button" className="lt-btn-secondary" onClick={newGame}>
            ↺ Nuova partita
          </button>
          <button
            type="button"
            className="lt-btn-secondary"
            onClick={undo}
            disabled={!prev}
            title={prev ? 'Annulla l’ultima mossa' : 'Nessuna mossa da annullare'}
          >
            ↩ Annulla
          </button>
        </div>
      </div>

      <p data-testid="g2048-status" aria-live="polite" style={{ margin: 0 }}>
        {status}
      </p>

      {winOpen && !over && (
        <div data-testid="g2048-win" role="status" style={banner}>
          <strong>🎉 Hai vinto! Hai raggiunto 2048.</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="lt-btn-secondary" onClick={() => setWinOpen(false)}>
              Continua
            </button>
            <button type="button" className="lt-btn" onClick={newGame}>
              Rigioca
            </button>
          </div>
        </div>
      )}

      {over && (
        <div data-testid="g2048-over" role="alert" style={banner}>
          <strong>😵 Partita finita — nessuna mossa rimasta.</strong>
          <span>
            Punteggio {score} • Record {best}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="lt-btn" onClick={newGame}>
              Rigioca
            </button>
            {prev && (
              <button type="button" className="lt-btn-secondary" onClick={undo}>
                ↩ Annulla ultima
              </button>
            )}
          </div>
        </div>
      )}

      <div
        data-testid="g2048-grid"
        role="grid"
        aria-label="Griglia 2048, 4 per 4"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={board}
      >
        {grid.map((row, r) =>
          row.map((v, c) => (
            <div
              key={`${r}-${c}`}
              role="gridcell"
              aria-label={v === 0 ? 'vuota' : String(v)}
              data-testid={`g2048-cell-${r}-${c}`}
              style={{
                ...cell,
                background: cellBg(v),
                color: cellFg(v),
                fontSize: cellFont(v),
              }}
            >
              {v !== 0 ? v : ''}
            </div>
          )),
        )}
      </div>

      <p style={{ margin: 0 }}>
        <small className="lt-meta">
          Muovi con frecce direzionali, WASD o swipe. Ogni mossa fa apparire un 2 (o raro 4).
          Il record è salvato su questo dispositivo.
        </small>
      </p>
    </div>
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

const scoreValue: React.CSSProperties = { fontSize: 22, lineHeight: 1.1 };

const banner: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  border: '2px solid #edc22e',
  borderRadius: 10,
  padding: 12,
  background: '#fef9e7',
  color: '#776e65',
};

const board: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8,
  background: '#bbada0',
  borderRadius: 10,
  padding: 8,
  touchAction: 'none',
  userSelect: 'none',
  maxWidth: 440,
};

const cell: React.CSSProperties = {
  aspectRatio: '1',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
};
