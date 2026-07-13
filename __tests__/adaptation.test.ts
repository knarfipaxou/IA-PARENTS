import { buildAdaptationConsignes, computeCompetenceStats } from '../lib/adaptation';
import type { DrillResult } from '../types/childProfile';

function r(competence: string, reussite: boolean): DrillResult {
  return {
    id: `r-${Math.random()}`, sessionId: 's', exerciseId: 'e', childId: 'c1',
    date: '2026-07-01', matiere: 'Maths', competence, reussite,
  };
}

describe('moteur de progression (adaptation)', () => {
  it('≥3 échecs consécutifs → baisser la difficulté', () => {
    const results = [r('fractions', false), r('fractions', false), r('fractions', false)];
    const c = buildAdaptationConsignes(results);
    expect(c.join(' ')).toMatch(/BAISSE la difficulté/);
  });

  it('≥3 essais, ≥90% et 3 réussites d’affilée → augmenter la difficulté', () => {
    const results = [r('calcul', true), r('calcul', true), r('calcul', true)];
    const c = buildAdaptationConsignes(results);
    expect(c.join(' ')).toMatch(/AUGMENTE/);
  });

  it('<60% de réussite → consolider les bases', () => {
    const results = [
      r('equations', true), r('equations', false),
      r('equations', false), r('equations', false), r('equations', false),
    ];
    const c = buildAdaptationConsignes(results);
    expect(c.join(' ')).toMatch(/consolide les bases/);
  });

  it('compte correctement les échecs consécutifs en tête', () => {
    const stats = computeCompetenceStats([r('x', false), r('x', false), r('x', true)]);
    expect(stats[0].echecsConsecutifs).toBe(2);
    expect(stats[0].total).toBe(3);
  });
});
