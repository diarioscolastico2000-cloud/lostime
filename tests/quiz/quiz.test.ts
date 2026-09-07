import { describe, it, expect } from 'vitest';
import { checkAnswer } from '../../src/features/quiz/quizEngine';

describe('quiz', () => {
  it('risposta corretta ritorna true', () => {
    expect(checkAnswer('q1', 0)).toBe(true);
  });
  it('risposta errata ritorna false', () => {
    expect(checkAnswer('q1', 2)).toBe(false);
  });
});
