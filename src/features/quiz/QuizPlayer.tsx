import { useMemo, useState } from 'react';
import { getQuestions, checkAnswer } from './quizEngine';

const BEST_KEY = 'lostime:quiz:best';

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function QuizPlayer() {
  const [qs] = useState(getQuestions);
  const [idx, setIdx] = useState(0);
  const [punti, setPunti] = useState(0);
  const [scelta, setScelta] = useState<number | null>(null);
  const [best, setBest] = useState(readBest);
  const q = qs[idx];
  const finito = !q;

  const progress = useMemo(
    () => (qs.length ? Math.round((idx / qs.length) * 100) : 0),
    [idx, qs.length],
  );

  function rispondi(i: number) {
    if (!q || scelta !== null) return;
    setScelta(i);
    if (checkAnswer(q.id, i)) setPunti((p) => p + 1);
  }

  function avanti() {
    setScelta(null);
    setIdx((v) => v + 1);
  }

  function ricomincia() {
    const totale = punti;
    if (totale > best) {
      setBest(totale);
      try {
        localStorage.setItem(BEST_KEY, String(totale));
      } catch {
        /* offline / privacy: ignora */
      }
    }
    setIdx(0);
    setPunti(0);
    setScelta(null);
  }

  if (finito) {
    const nuovoRecord = punti > best;
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h2>Finito! Punti {punti}/{qs.length}</h2>
        <p>{nuovoRecord ? '🎉 Nuovo record!' : `Record: ${Math.max(best, punti)}`}</p>
        <button style={{ minHeight: 44, borderRadius: 12 }} onClick={ricomincia}>Rigioca</button>
      </div>
    );
  }

  const corretta = (q.corretta ?? q.correttaIndex ?? 0) as number;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div aria-label="avanzamento" style={{ height: 8, borderRadius: 8, background: '#2a2a3a' }}>
        <div style={{ width: `${progress}%`, height: '100%', borderRadius: 8, background: '#FFD23F' }} />
      </div>
      <p>Domanda {idx + 1}/{qs.length} — Punti {punti}</p>
      <h2>{q.domanda}</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {q.scelte.map((s, i) => {
          const isRight = scelta !== null && i === corretta;
          const isWrong = scelta === i && i !== corretta;
          return (
            <button
              key={i}
              style={{
                minHeight: 44, borderRadius: 12, textAlign: 'left', padding: '12px 14px',
                background: isRight ? '#2e7d32' : isWrong ? '#c62828' : '#1e1e2a',
                color: '#fff', border: '1px solid #333',
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
          <p>{scelta === corretta ? '✅ Giusto!' : '❌ Sbagliato'}</p>
          <p>{q.spiegazione}</p>
          <button style={{ minHeight: 44, borderRadius: 12 }} onClick={avanti}>
            {idx + 1 === qs.length ? 'Vedi risultato' : 'Prossima'}
          </button>
        </div>
      )}
    </div>
  );
}
