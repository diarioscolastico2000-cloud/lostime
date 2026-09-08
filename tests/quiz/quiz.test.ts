import { describe, it, expect } from 'vitest';
import { checkAnswer, getCategories, getQuestionsByCategory, getQuestions, isTimeout, streakBonus, QUESTION_TIME_SECONDS } from '../../src/features/quiz/quizEngine';

describe('quiz', () => {
  it('risposta corretta ritorna true', () => {
    expect(checkAnswer('q1', 0)).toBe(true);
  });
  it('risposta errata ritorna false', () => {
    expect(checkAnswer('q1', 2)).toBe(false);
  });
  it('categorie non vuote e con le 6 attese', () => {
    const cats = getCategories();
    expect(cats.length).toBeGreaterThanOrEqual(6);
    for (const c of ['scienza', 'storia', 'geografia', 'spazio', 'natura', 'tech']) {
      expect(cats).toContain(c);
    }
  });
  it('almeno 24 domande con categoria e spiegazione', () => {
    const qs = getQuestions();
    expect(qs.length).toBeGreaterThanOrEqual(24);
    for (const q of qs) {
      expect(q.categoria).toBeTruthy();
      expect(q.spiegazione).toBeTruthy();
    }
    expect(qs.find((q) => q.id === 'q1')).toBeTruthy();
    expect(qs.find((q) => q.id === 'q2')).toBeTruthy();
  });
  it('filtro categoria funziona', () => {
    const cats = getCategories();
    for (const c of cats) {
      const list = getQuestionsByCategory(c);
      expect(list.length).toBeGreaterThan(0);
      for (const q of list) expect(q.categoria).toBe(c);
    }
    expect(getQuestionsByCategory('tutte').length).toBe(getQuestions().length);
  });
  it('isTimeout scatta al limite (20s)', () => {
    expect(QUESTION_TIME_SECONDS).toBe(20);
    expect(isTimeout(20)).toBe(true);
    expect(isTimeout(21)).toBe(true);
    expect(isTimeout(19)).toBe(false);
    expect(isTimeout(0)).toBe(false);
  });
  it('streakBonus da +1 ogni 3 di fila', () => {
    expect(streakBonus(1)).toBe(0);
    expect(streakBonus(2)).toBe(0);
    expect(streakBonus(3)).toBe(1);
    expect(streakBonus(6)).toBe(1);
    expect(streakBonus(4)).toBe(0);
  });
});
