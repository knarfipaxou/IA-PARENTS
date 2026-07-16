import { computeCoverage, coverageAcceptable, knowledgeForLevel, splitIntoParts, partLabels } from '../lib/coverage';
import type { KnowledgeItem, MissionQuestion } from '../services/agents/types';

function K(id: string, importance: KnowledgeItem['importance'], level: KnowledgeItem['cognitiveLevel'] = 'remember'): KnowledgeItem {
  return { knowledgeId: id, type: 'fait', label: id, content: id, importance, cognitiveLevel: level };
}

function Q(id: string, knowledgeIds: string[], minutes = 2): MissionQuestion {
  return {
    question_id: id, enonce: id, points_total: 1, expected_answer: 'r',
    correction_criteria: [{ criterion_id: `${id}-C1`, label: 'ok', points: 1 }],
    knowledgeIds, estimatedMinutes: minutes,
  } as MissionQuestion;
}

describe('couverture des connaissances (calcul en code, déterministe)', () => {
  const scoped = [K('E1', 'essential'), K('E2', 'essential'), K('I1', 'important'), K('I2', 'important'), K('S1', 'secondary')];

  it('100 % essentiel + ≥90 % important → acceptable', () => {
    const cov = computeCoverage(scoped, [Q('Q1', ['E1', 'E2']), Q('Q2', ['I1', 'I2'])]);
    expect(cov.essentialPct).toBe(100);
    expect(cov.importantPct).toBe(100);
    expect(coverageAcceptable(cov)).toBe(true);
  });

  it('une essentielle manquante → refusé, avec les ids manquants', () => {
    const cov = computeCoverage(scoped, [Q('Q1', ['E1', 'I1', 'I2'])]);
    expect(cov.essentialPct).toBe(50);
    expect(cov.missingEssentialIds).toEqual(['E2']);
    expect(coverageAcceptable(cov)).toBe(false);
  });

  it('importantes < 90 % → refusé même si essentiel = 100 %', () => {
    const many = [K('E1', 'essential'), ...Array.from({ length: 10 }, (_, i) => K(`I${i}`, 'important'))];
    const cov = computeCoverage(many, [Q('Q1', ['E1', ...Array.from({ length: 8 }, (_, i) => `I${i}`)])]);
    expect(cov.essentialPct).toBe(100);
    expect(cov.importantPct).toBe(80);
    expect(coverageAcceptable(cov)).toBe(false);
  });

  it('aucune connaissance du niveau → 100 % par convention', () => {
    const cov = computeCoverage([], []);
    expect(cov.essentialPct).toBe(100);
    expect(coverageAcceptable(cov)).toBe(true);
  });

  it('knowledgeForLevel filtre par niveau cognitif', () => {
    const all = [K('R1', 'essential', 'remember'), K('U1', 'essential', 'understand')];
    expect(knowledgeForLevel(all, 'remember').map((k) => k.knowledgeId)).toEqual(['R1']);
  });
});

describe('division automatique en sous-parties (Mémoire A/B)', () => {
  it('pas de division sous les seuils (≤15 blocs, ≤20 min)', () => {
    const qs = Array.from({ length: 8 }, (_, i) => Q(`Q${i}`, ['E1'], 2));
    expect(partLabels(splitIntoParts(qs))).toEqual([]);
  });

  it('divise au-delà de 15 blocs', () => {
    const qs = Array.from({ length: 22 }, (_, i) => Q(`Q${i}`, ['E1'], 0.5));
    const parts = partLabels(splitIntoParts(qs));
    expect(parts).toEqual(['A', 'B']);
  });

  it('divise au-delà de 20 minutes estimées', () => {
    const qs = Array.from({ length: 10 }, (_, i) => Q(`Q${i}`, ['E1'], 4)); // 40 min
    const split = splitIntoParts(qs);
    expect(partLabels(split)).toEqual(['A', 'B']);
    // toutes les questions restent dans la même mission
    expect(split).toHaveLength(10);
  });
});
