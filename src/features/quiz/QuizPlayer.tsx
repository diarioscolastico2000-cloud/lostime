import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  checkAnswer,
  getCategories,
  getQuestionsByCategory,
  streakBonus,
  QUESTION_TIME_SECONDS,
  type QuizQuestion,
} from './quizEngine';

const BEST_KEY = 'lostime:quiz:best';
const BEST_CAT_PREFIX = 'lostime:quiz:best:';

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function readBestCat(cat: string): number {
  try {
    return Number(localStorage.getItem(BEST_CAT_PREFIX + cat) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function writeBest(v: number) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* offline / privacy: ignora */
  }
}

function writeBestCat(cat: string, v: number) {
  try {
    localStorage.setItem(BEST_CAT_PREFIX + cat, String(v));
  } catch {
    /* offline / privacy: ignora */
  }
}

type Esito = {
  id: string;
  domanda: string;
  scelte: string[];
  corretta: number;
  data: number | null;
  giusta: boolean;
  timeout: boolean;
  spiegazione: string;
};

const btnBase: CSSProperties = {
  minHeight: 44,
  minWidth: 44,
  borderRadius: 12,
  padding: '12px 14px',
  textAlign: 'left',
  background: '#1e1e2a',
  color: '#fff',
  border: '1px solid #333',
  cursor: 'pointer',
};

export function QuizPlayer() {
  const categorie = useMemo(getCategories, []);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [qs, setQs] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [punti, setPunti] = useState(0);
  const [scelta, setScelta] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [esiti, setEsiti] = useState<Esito[]>([]);
  const [best, setBest] = useState(readBest);
  const [bestCat, setBestCat] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const savedRef = useRef<string | null>(null);

  const q = qs[idx];
  const finito = categoria !== null && !q;

  const progress = useMemo(
    () => (qs.length ? Math.round((idx / qs.length) * 100) : 0),
    [idx, qs.length],
  );
  const timePct = Math.max(0, Math.round((timeLeft / QUESTION_TIME_SECONDS) * 100));

  function inizia(cat: string) {
    const list = getQuestionsByCategory(cat);
    setCategoria(cat);
    setQs(list);
    setIdx(0);
    setPunti(0);
    setScelta(null);
    setStreak(0);
    setBestStreak(0);
    setEsiti([]);
    setTimeLeft(QUESTION_TIME_SECONDS);
    setBestCat(readBestCat(cat));
    savedRef.current = null;
  }

  function registraEsito(s: number | null, timedOut: boolean) {
    if (!q) return;
    const corretta = (q.corretta ?? q.correttaIndex ?? 0) as number;
    const giusta = !timedOut && s === corretta;
    setEsiti((prev) => [
      ...prev,
      {
        id: q.id,
        domanda: q.domanda,
        scelte: q.scelte,
        corretta,
        data: timedOut ? null : s,
        giusta,
        timeout: timedOut,
        spiegazione: q.spiegazione,
      },
    ]);
    return giusta;
  }

  function rispondi(i: number) {
    if (!q || scelta !== null) return;
    setScelta(i);
    const giusta = registraEsito(i, false);
    if (giusta) {
      const nuovoStreak = streak + 1;
      setStreak(nuovoStreak);
      setBestStreak((b) => Math.max(b, nuovoStreak));
      setPunti((p) => p + 1 + streakBonus(nuovoStreak));
    } else {
      setStreak(0);
    }
  }

  function handleTimeout() {
    if (!q || scelta !== null) return;
    setScelta(-1);
    setStreak(0);
    registraEsito(null, true);
  }

  // Reset timer a ogni domanda / categoria
  useEffect(() => {
    setTimeLeft(QUESTION_TIME_SECONDS);
  }, [idx, categoria, qs.length]);

  // Countdown: tick ogni secondo finché non si risponde
  useEffect(() => {
    if (categoria === null || finito || scelta !== null) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, scelta, categoria, finito, idx]);

  // Salva record globale + per categoria a fine partita (una sola volta)
  useEffect(() => {
    if (!finito || !categoria || savedRef.current === `${categoria}:${qs.length}:${esiti.length}`) return;
    savedRef.current = `${categoria}:${qs.length}:${esiti.length}`;
    if (punti > best) {
      setBest(punti);
      writeBest(punti);
    }
    if (punti > bestCat) {
      setBestCat(punti);
      writeBestCat(categoria, punti);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finito]);

  function ricomincia() {
    const totale = punti;
    if (totale > best) {
      setBest(totale);
      writeBest(totale);
    }
    if (categoria && totale > bestCat) {
      setBestCat(totale);
      writeBestCat(categoria, totale);
    }
    savedRef.current = null;
    setIdx(0);
    setPunti(0);
    setScelta(null);
    setStreak(0);
    setBestStreak(0);
    setEsiti([]);
    setTimeLeft(QUESTION_TIME_SECONDS);
  }

  function cambiaCategoria() {
    const totale = punti;
    if (totale > best) {
      setBest(totale);
      writeBest(totale);
    }
    if (categoria && totale > bestCat) {
      writeBestCat(categoria, totale);
    }
    setCategoria(null);
    setQs([]);
    setIdx(0);
    setPunti(0);
    setScelta(null);
    setStreak(0);
    setBestStreak(0);
    setEsiti([]);
    savedRef.current = null;
  }

  // --- Schermata iniziale: scelta categoria ---
  if (categoria === null) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h2>Scegli categoria</h2>
        <p>Record globale: {Math.max(best, punti)}</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <button style={{ ...btnBase, textAlign: 'center' }} onClick={() => inizia('tutte')}>
            Tutte ({getQuestionsByCategory('tutte').length}) — Best {readBestCat('tutte')}
          </button>
          {categorie.map((c) => (
            <button key={c} style={{ ...btnBase, textAlign: 'center' }} onClick={() => inizia(c)}>
              {c} ({getQuestionsByCategory(c).length}) — Best {readBestCat(c)}
            </button>
          ))}
        </div>
        <p style={{ opacity: 0.7 }}>20 secondi per domanda · bonus +1 ogni 3 risposte giuste di fila</p>
      </div>
    );
  }

  if (finito) {
    const nuovoRecord = punti > best;
    const nuovoRecordCat = punti > bestCat;
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h2>
          Finito! Punti {punti}/{qs.length}
        </h2>
        <div aria-live="polite">
          <p>
            {nuovoRecord ? '🎉 Nuovo record!' : `Record: ${Math.max(best, punti)}`}
            {' · '}
            {nuovoRecordCat
              ? `🎉 Nuovo record categoria "${categoria}"!`
              : `Record "${categoria}": ${Math.max(bestCat, punti)}`}
          </p>
          <p>Streak migliore: {bestStreak} di fila</p>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {esiti.map((e, n) => (
            <div key={e.id} style={{ borderRadius: 12, padding: 10, background: '#1e1e2a', border: '1px solid #333' }}>
              <p>
                <strong>
                  {n + 1}. {e.domanda}
                </strong>{' '}
                {e.giusta ? '✅' : e.timeout ? '⏱️ tempo scaduto' : '❌'}
              </p>
              <p style={{ opacity: 0.85 }}>
                Tua risposta: {e.timeout || e.data === null ? '— (tempo scaduto)' : e.scelte[e.data]}{' '}
                · Corretta: {e.scelte[e.corretta]}
              </p>
              <p style={{ opacity: 0.75 }}>{e.spiegazione}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={{ ...btnBase, textAlign: 'center', flex: 1 }} onClick={ricomincia}>
            Rigioca ({categoria})
          </button>
          <button style={{ ...btnBase, textAlign: 'center', flex: 1 }} onClick={cambiaCategoria}>
            Cambia categoria
          </button>
        </div>
      </div>
    );
  }

  const corretta = (q.corretta ?? q.correttaIndex ?? 0) as number;
  const timedOut = scelta === -1;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div aria-label="avanzamento" style={{ height: 8, borderRadius: 8, background: '#2a2a3a' }}>
        <div style={{ width: `${progress}%`, height: '100%', borderRadius: 8, background: '#FFD23F' }} />
      </div>
      <div
        role="progressbar"
        aria-label="tempo rimasto"
        aria-valuemin={0}
        aria-valuemax={QUESTION_TIME_SECONDS}
        aria-valuenow={timeLeft}
        style={{ height: 8, borderRadius: 8, background: '#2a2a3a' }}
      >
        <div
          style={{
            width: `${timePct}%`,
            height: '100%',
            borderRadius: 8,
            background: timeLeft <= 5 ? '#c62828' : '#4fc3f7',
          }}
        />
      </div>
      <p>
        Domanda {idx + 1}/{qs.length} — Punti {punti} · {categoria} · 🔥 {streak} di fila · ⏱️ {timeLeft}s
      </p>
      <h2>{q.domanda}</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {q.scelte.map((s, i) => {
          const isRight = scelta !== null && i === corretta;
          const isWrong = scelta === i && i !== corretta;
          return (
            <button
              key={i}
              style={{
                ...btnBase,
                background: isRight ? '#2e7d32' : isWrong ? '#c62828' : timedOut ? '#1e1e2a' : '#1e1e2a',
                opacity: timedOut && i !== corretta ? 0.7 : 1,
              }}
              onClick={() => rispondi(i)}
              disabled={scelta !== null}
              aria-pressed={scelta === i}
            >
              {s}
            </button>
          );
        })}
      </div>
      {scelta !== null && (
        <div style={{ borderRadius: 16, padding: 12, background: '#1e1e2a' }}>
          <div aria-live="polite">
            <p>
              {timedOut
                ? '⏱️ Tempo scaduto! Risposta sbagliata.'
                : scelta === corretta
                  ? `✅ Giusto!${streakBonus(streak) ? ' +1 bonus streak! 🔥' : ''}`
                  : '❌ Sbagliato'}
            </p>
          </div>
          <p>{q.spiegazione}</p>
          <button style={{ ...btnBase, textAlign: 'center', width: '100%' }} onClick={() => { setScelta(null); setIdx((v) => v + 1); }}>
            {idx + 1 === qs.length ? 'Vedi risultato' : 'Prossima'}
          </button>
        </div>
      )}
      <button style={{ ...btnBase, textAlign: 'center' }} onClick={cambiaCategoria}>
        Cambia categoria
      </button>
    </div>
  );
}
