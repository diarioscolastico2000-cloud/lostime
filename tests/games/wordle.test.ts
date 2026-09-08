import { describe, it, expect } from 'vitest';
import {
  MAX_TENTATIVI,
  WORD_LEN,
  evaluateGuess,
  getKeyStates,
  isValidWord,
  isWinningGuess,
} from '../../src/features/games/wordle/engineWordle';
import { WORDS, pickDaily, pickRandom } from '../../src/features/games/wordle/words';

describe('wordle words', () => {
  it('almeno 80 parole da 5 lettere maiuscole senza accenti', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(80);
    const uniche = new Set(WORDS);
    expect(uniche.size).toBe(WORDS.length);
    for (const w of WORDS) {
      expect(w).toMatch(/^[A-Z]{5}$/);
    }
  });

  it('pickDaily deterministica: stessa data stessa parola', () => {
    const d = new Date(2026, 8, 8, 12, 0, 0);
    expect(pickDaily(d)).toBe(pickDaily(new Date(2026, 8, 8, 23, 59, 59)));
    expect(WORDS).toContain(pickDaily(d));
    // Giorni diversi (quasi sempre) parole diverse su finestra di 10 giorni
    const seq = Array.from({ length: 10 }, (_, i) => pickDaily(new Date(2026, 8, i + 1)));
    expect(new Set(seq).size).toBeGreaterThan(1);
  });

  it('pickRandom resta nel dizionario', () => {
    for (let i = 0; i < 20; i++) expect(WORDS).toContain(pickRandom(() => i / 20));
  });
});

describe('wordle engine', () => {
  it('doppie lettere: soluzione NONNA, guess ANNAS', () => {
    // NONNA = N O N N A ; ANNAS = A N N A S
    // pos2 N correct; A->present (1 sola A in soluzione), N->present (restano 2 N),
    // seconda A->absent (A esaurita), S->absent.
    expect(evaluateGuess('NONNA', 'ANNAS')).toEqual([
      'present',
      'present',
      'correct',
      'absent',
      'absent',
    ]);
  });

  it('doppie nel guess oltre la soluzione: tutto correct tranne eccesso', () => {
    // Soluzione NONNA (3 N), guess NNNNN: pos0,2,3 correct; pos1,4 absent.
    expect(evaluateGuess('NONNA', 'NNNNN')).toEqual([
      'correct',
      'absent',
      'correct',
      'correct',
      'absent',
    ]);
  });

  it('parola valida/invalida', () => {
    expect(isValidWord('PIANO')).toBe(true);
    expect(isValidWord('piano')).toBe(true); // case-insensitive
    expect(isValidWord('XXXXX')).toBe(false);
    expect(isValidWord('PIAN')).toBe(false);
    expect(isValidWord('PIANOO')).toBe(false);
    expect(isValidWord('')).toBe(false);
  });

  it('vittoria in 6: solo l’ultimo tentativo è vincente', () => {
    const soluzione = 'PIANO';
    const sequenza = ['ROSSO', 'GATTO', 'TERRA', 'GENTE', 'FESTA', 'PIANO'];
    expect(WORDS).toContain(soluzione);
    for (const w of sequenza) expect(w).toHaveLength(WORD_LEN);
    const vinte = sequenza.map((g) => isWinningGuess(soluzione, g));
    expect(vinte.slice(0, 5).every((v) => v === false)).toBe(true);
    expect(vinte[5]).toBe(true);
    expect(sequenza).toHaveLength(MAX_TENTATIVI);
    expect(evaluateGuess(soluzione, 'PIANO')).toEqual([
      'correct',
      'correct',
      'correct',
      'correct',
      'correct',
    ]);
  });

  it('tastiera stati: correct vince su present/absent', () => {
    const stati = getKeyStates(['ROSSO', 'PIANO'], 'PIANO');
    // ROSSO vs PIANO: O in pos4 è correct; R,S absent.
    // PIANO completa tutto a correct.
    expect(stati['P']).toBe('correct');
    expect(stati['I']).toBe('correct');
    expect(stati['A']).toBe('correct');
    expect(stati['N']).toBe('correct');
    expect(stati['O']).toBe('correct');
    expect(stati['R']).toBe('absent');
    expect(stati['S']).toBe('absent');
  });

  it('tastiera stati: present conservato se mai correct', () => {
    // Soluzione PIANO, guess ONORE: O e N presenti ma altrove, R/E assenti.
    const stati = getKeyStates(['ONORE'], 'PIANO');
    expect(stati['N']).toBe('present');
    expect(stati['O']).toBe('present');
    expect(stati['R']).toBe('absent');
    expect(stati['E']).toBe('absent');
  });
});
