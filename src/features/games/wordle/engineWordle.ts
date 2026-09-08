/** Engine Wordle puro: nessuna dipendenza da React/DOM. Funzioni pure testabili. */

import { WORDS, normalizeWord } from './words';

export type LetterState = 'correct' | 'present' | 'absent';

export const WORD_LEN = 5;
export const MAX_TENTATIVI = 6;

/**
 * Valuta un tentativo contro la soluzione (stile Wordle, due passate).
 * Gestisce le doppie lettere: prima i 'correct', poi i 'present'
 * consumando le occorrenze rimaste della soluzione.
 * Accetta qualsiasi stringa di 5 lettere (anche fuori dizionario);
 * la validità dizionario è compito di isValidWord.
 */
export function evaluateGuess(solution: string, guess: string): LetterState[] {
  const sol = normalizeWord(solution).split('');
  const att = normalizeWord(guess).split('');
  const out: LetterState[] = Array<LetterState>(WORD_LEN).fill('absent');
  const rimaste = new Map<string, number>();

  for (let i = 0; i < WORD_LEN; i++) {
    if (att[i] === sol[i]) {
      out[i] = 'correct';
    } else {
      rimaste.set(sol[i], (rimaste.get(sol[i]) ?? 0) + 1);
    }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (out[i] === 'correct') continue;
    const n = rimaste.get(att[i]) ?? 0;
    if (n > 0) {
      out[i] = 'present';
      rimaste.set(att[i], n - 1);
    } else {
      out[i] = 'absent';
    }
  }
  return out;
}

/** True se la parola è di 5 lettere A-Z e presente nel dizionario. */
export function isValidWord(guess: string, words: readonly string[] = WORDS): boolean {
  const w = normalizeWord(guess);
  if (!/^[A-Z]{5}$/.test(w)) return false;
  return (words as readonly string[]).includes(w);
}

/** True se il tentativo è esattamente la soluzione. */
export function isWinningGuess(solution: string, guess: string): boolean {
  return normalizeWord(solution) === normalizeWord(guess);
}

const PRIORITA: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/**
 * Stati tastiera dai tentativi inviati: per ogni lettera il migliore stato visto.
 * Priorità: correct > present > absent.
 */
export function getKeyStates(
  guesses: readonly string[],
  solution: string,
): Record<string, LetterState> {
  const out: Record<string, LetterState> = {};
  for (const g of guesses) {
    const states = evaluateGuess(solution, g);
    const letters = normalizeWord(g).split('');
    for (let i = 0; i < WORD_LEN; i++) {
      const L = letters[i];
      const s = states[i];
      if ((PRIORITA[s] ?? 0) >= (PRIORITA[out[L]] ?? -1)) {
        if (out[L] === undefined || (PRIORITA[s] ?? 0) > (PRIORITA[out[L]] ?? -1)) {
          out[L] = s;
        }
      }
    }
  }
  return out;
}

/** Alias italiano per la tastiera. */
export const keyStates = getKeyStates;

/** Emoji condivisione per una riga valutata. */
export function stateToEmoji(s: LetterState): string {
  if (s === 'correct') return '🟩';
  if (s === 'present') return '🟨';
  return '⬛';
}
