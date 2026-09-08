import quiz from './quiz.json';

export type Difficolta = 'facile' | 'media' | 'difficile';

export type QuizQuestion = {
  id: string;
  domanda: string;
  scelte: string[];
  /** campo storico */ corretta: number;
  /** alias nuovo formato docs */ correttaIndex?: number;
  spiegazione: string;
  categoria: string;
  difficolta: Difficolta | string;
};

/** Secondi per rispondere a ogni domanda (usato dal QuizPlayer). */
export const QUESTION_TIME_SECONDS = 20;

function normalize(q: QuizQuestion): QuizQuestion {
  const corretta = q.corretta ?? q.correttaIndex ?? 0;
  return {
    ...q,
    corretta,
    correttaIndex: q.correttaIndex ?? corretta,
    categoria: q.categoria ?? 'scienza',
    difficolta: (q.difficolta as Difficolta) ?? 'facile',
  };
}

export function getQuestions(): QuizQuestion[] {
  return (quiz as QuizQuestion[]).map(normalize);
}

export function getQuestionById(domandaId: string): QuizQuestion | undefined {
  return getQuestions().find((x) => x.id === domandaId);
}

export function checkAnswer(domandaId: string, scelta: number): boolean {
  const q = getQuestionById(domandaId);
  if (!q) throw new Error('NOT_FOUND');
  return q.corretta === scelta;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getShuffledQuestions(): QuizQuestion[] {
  return shuffle(getQuestions());
}

export function scoreAnswers(risposte: Record<string, number>): { punti: number; totali: number } {
  const qs = getQuestions();
  let punti = 0;
  for (const q of qs) {
    if (risposte[q.id] === q.corretta) punti += 1;
  }
  return { punti, totali: qs.length };
}

export function getCategories(): string[] {
  const seen = new Set<string>();
  for (const q of getQuestions()) {
    if (q.categoria) seen.add(q.categoria);
  }
  return [...seen];
}

export function getQuestionsByCategory(cat: string): QuizQuestion[] {
  if (!cat || cat === 'tutte' || cat === 'all') return getQuestions();
  return getQuestions().filter((q) => q.categoria === cat);
}

/** True quando il tempo è scaduto (elapsed >= limit). Helper testabile per il timer. */
export function isTimeout(elapsedSeconds: number, limitSeconds: number = QUESTION_TIME_SECONDS): boolean {
  return elapsedSeconds >= limitSeconds;
}

/** Bonus streak: +1 ogni 3 risposte giuste di fila. */
export function streakBonus(streak: number): number {
  return streak > 0 && streak % 3 === 0 ? 1 : 0;
}
