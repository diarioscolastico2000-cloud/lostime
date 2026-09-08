import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BUCHI_PER_LIVELLO,
  contaBuchi,
  generaPuzzle,
  hint as hintEngine,
  isComplete,
  isValidMove,
  type Grid,
  type Livello,
} from './engineSudoku';

const HINT_MAX = 3;
const bestKey = (l: Livello) => `lostime:sudoku:best:${l}`;

function loadBest(l: Livello): number | null {
  try {
    const raw = localStorage.getItem(bestKey(l));
    const n = raw == null ? NaN : Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function saveBest(l: Livello, sec: number): void {
  try {
    const prev = loadBest(l);
    if (prev == null || sec < prev) localStorage.setItem(bestKey(l), String(sec));
  } catch {
    /* storage non disponibile */
  }
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type Sel = { r: number; c: number } | null;

function celleErrate(griglia: Grid): Set<string> {
  const err = new Set<string>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = griglia[r][c];
      if (v === 0) continue;
      // mossa valida? (ignora la cella stessa)
      if (!isValidMove(griglia, r, c, v)) err.add(`${r},${c}`);
    }
  }
  return err;
}

export function SudokuBoard() {
  const [livello, setLivello] = useState<Livello>('facile');
  const [dati, setDati] = useState(() => generaPuzzle('facile'));
  const [griglia, setGriglia] = useState<Grid>(() => dati.puzzle.map((r) => [...r]));
  const [fisse, setFisse] = useState<boolean[][]>(() =>
    dati.puzzle.map((r) => r.map((v) => v !== 0)),
  );
  const [note, setNote] = useState<Set<number>[][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>())),
  );
  const [sel, setSel] = useState<Sel>(null);
  const [modalitaNote, setModalitaNote] = useState(false);
  const [secondi, setSecondi] = useState(0);
  const [hintRimasti, setHintRimasti] = useState(HINT_MAX);
  const [best, setBest] = useState<number | null>(() => loadBest('facile'));
  const vinto = useMemo(() => isComplete(griglia), [griglia]);
  const timerRef = useRef<number | null>(null);

  const errori = useMemo(() => celleErrate(griglia), [griglia]);
  const selValore = sel ? griglia[sel.r][sel.c] : 0;

  function nuovaPartita(l: Livello) {
    const p = generaPuzzle(l);
    setDati(p);
    setGriglia(p.puzzle.map((r) => [...r]));
    setFisse(p.puzzle.map((r) => r.map((v) => v !== 0)));
    setNote(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>())));
    setSel(null);
    setSecondi(0);
    setHintRimasti(HINT_MAX);
    setBest(loadBest(l));
  }

  // Timer: parte a ogni nuova partita, si ferma alla vittoria
  useEffect(() => {
    if (vinto) {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = window.setInterval(() => setSecondi((s) => s + 1), 1000);
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [dati, vinto]);

  // Salva best alla vittoria
  useEffect(() => {
    if (vinto) {
      saveBest(livello, secondi);
      setBest(loadBest(livello));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinto]);

  function cambiaLivello(l: Livello) {
    setLivello(l);
    nuovaPartita(l);
  }

  function inserisci(v: number) {
    if (!sel || vinto) return;
    const { r, c } = sel;
    if (fisse[r][c]) return;
    if (modalitaNote) {
      if (griglia[r][c] !== 0) return;
      setNote((prev) => {
        const next = prev.map((row) => row.map((s) => new Set(s)));
        if (next[r][c].has(v)) next[r][c].delete(v);
        else next[r][c].add(v);
        return next;
      });
      return;
    }
    setGriglia((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] === v ? 0 : v;
      return next;
    });
    // valore inserito: pulisci le note di quella cella
    setNote((prev) => {
      if (prev[r][c].size === 0) return prev;
      const next = prev.map((row) => row.map((s) => new Set(s)));
      next[r][c].clear();
      return next;
    });
  }

  function cancella() {
    if (!sel || vinto) return;
    const { r, c } = sel;
    if (fisse[r][c]) return;
    setGriglia((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = 0;
      return next;
    });
    setNote((prev) => {
      const next = prev.map((row) => row.map((s) => new Set(s)));
      next[r][c].clear();
      return next;
    });
  }

  function usaHint() {
    if (vinto || hintRimasti <= 0) return;
    const h = hintEngine(griglia, dati.soluzione);
    if (!h) return;
    setGriglia((prev) => {
      const next = prev.map((row) => [...row]);
      next[h.r][h.c] = h.valore;
      return next;
    });
    setNote((prev) => {
      const next = prev.map((row) => row.map((s) => new Set(s)));
      next[h.r][h.c].clear();
      return next;
    });
    setSel({ r: h.r, c: h.c });
    setHintRimasti((n) => n - 1);
  }

  // Tastiera fisica 1-9 / canc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!sel || vinto) return;
      if (e.key >= '1' && e.key <= '9') inserisci(Number(e.key));
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') cancella();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, vinto, modalitaNote, fisse, griglia]);

  const buchi = useMemo(() => contaBuchi(dati.puzzle), [dati]);

  function stessaZona(r: number, c: number): boolean {
    if (!sel) return false;
    if (sel.r === r || sel.c === c) return true;
    return (
      Math.floor(sel.r / 3) === Math.floor(r / 3) &&
      Math.floor(sel.c / 3) === Math.floor(c / 3)
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 440, margin: '0 auto' }}>
      <div>
        <h2 style={{ margin: '4px 0' }}>Sudoku</h2>
        <p className="lt-meta">
          {livello} • {buchi} vuote ({BUCHI_PER_LIVELLO[livello]} attese) • ⏱ {fmt(secondi)}
          {best != null ? ` • 🏆 best ${fmt(best)}` : ''}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Livello">
        {(['facile', 'medio', 'difficile'] as Livello[]).map((l) => (
          <button
            key={l}
            className={l === livello ? 'lt-btn' : 'lt-btn-secondary'}
            onClick={() => cambiaLivello(l)}
          >
            {l[0].toUpperCase() + l.slice(1)}
          </button>
        ))}
        <button className="lt-btn-secondary" onClick={() => nuovaPartita(livello)}>
          Nuova partita
        </button>
      </div>

      <div
        role="grid"
        aria-label="Griglia sudoku"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          border: '2px solid #333',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {griglia.map((riga, r) =>
          riga.map((v, c) => {
            const isSel = sel?.r === r && sel?.c === c;
            const evidenziata = stessaZona(r, c);
            const stessoNumero = selValore !== 0 && v === selValore;
            const errata = errori.has(`${r},${c}`);
            const fissa = fisse[r][c];
            const notes = note[r][c];
            return (
              <button
                key={`${r}-${c}`}
                role="gridcell"
                aria-label={`Riga ${r + 1} colonna ${c + 1}${v ? ` valore ${v}` : ' vuota'}`}
                aria-selected={isSel}
                onClick={() => setSel({ r, c })}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: v ? 20 : 10,
                  fontWeight: fissa ? 700 : 500,
                  color: errata ? '#c0392b' : fissa ? '#1a1a1a' : '#0b5ed7',
                  background: isSel ? '#ffe08a' : stessoNumero ? '#fff3c4' : evidenziata ? '#f0f4ff' : '#fff',
                  border: 'none',
                  borderRight: `1px solid ${(c + 1) % 3 === 0 && c !== 8 ? '#333' : '#ddd'}`,
                  borderBottom: `1px solid ${(r + 1) % 3 === 0 && r !== 8 ? '#333' : '#ddd'}`,
                  cursor: fissa ? 'default' : 'pointer',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                {v !== 0 ? (
                  v
                ) : notes.size > 0 ? (
                  <span
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      fontSize: 9,
                      color: '#555',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <span key={n}>{notes.has(n) ? n : ''}</span>
                    ))}
                  </span>
                ) : (
                  ''
                )}
              </button>
            );
          }),
        )}
      </div>

      {vinto ? (
        <div
          role="status"
          style={{ background: '#e7f7e7', border: '1px solid #2e7d32', borderRadius: 8, padding: 12 }}
        >
          <strong>🎉 Sudoku completato in {fmt(secondi)}!</strong>
          <p className="lt-meta">
            Livello {livello}
            {best != null ? ` • best ${fmt(best)}` : ''}
          </p>
          <button className="lt-btn" onClick={() => nuovaPartita(livello)}>
            Rigioca
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} className="lt-btn-secondary" onClick={() => inserisci(n)}>
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="lt-btn-secondary" onClick={cancella}>
              ⌫ Cancella
            </button>
            <button
              className={modalitaNote ? 'lt-btn' : 'lt-btn-secondary'}
              onClick={() => setModalitaNote((m) => !m)}
              aria-pressed={modalitaNote}
            >
              ✏️ Note {modalitaNote ? 'ON' : 'OFF'}
            </button>
            <button
              className="lt-btn-secondary"
              onClick={usaHint}
              disabled={hintRimasti <= 0}
              title={hintRimasti <= 0 ? 'Hint esauriti' : 'Riempi una cella'}
            >
              💡 Hint ({hintRimasti}/{HINT_MAX})
            </button>
          </div>
          {errori.size > 0 && (
            <p role="alert" style={{ color: '#c0392b', margin: 0 }}>
              ⚠️ {errori.size} {errori.size === 1 ? 'cella in conflitto' : 'celle in conflitto'}
            </p>
          )}
        </>
      )}

      <p className="lt-meta">
        Tocca una cella e usa il tastierino (o i tasti 1–9). Offline, senza account. Hint: {HINT_MAX}{' '}
        a partita.
      </p>
    </div>
  );
}
