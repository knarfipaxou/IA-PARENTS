import { computeCriteriaScore, questionMastered, critKey } from '../lib/masteryScoring';

const QUESTIONS = [
  {
    enonce: 'Calcule le périmètre du rectangle (L = 5 cm, l = 3 cm).',
    notion: 'périmètre',
    correction_criteria: [
      { criterion_id: 'Q1-C1', label: 'Formule écrite avant le calcul', points: 1, required_for_mastery: true },
      { criterion_id: 'Q1-C2', label: 'Calcul exact', points: 1, required_for_mastery: true },
      { criterion_id: 'Q1-C3', label: 'Unité et conclusion', points: 1 },
    ],
  },
  {
    enonce: 'Définis un quadrilatère.',
    notion: 'définitions',
    correction_criteria: [
      { criterion_id: 'Q2-C1', label: 'Définition complète', points: 2, required_for_mastery: true },
    ],
  },
];

describe('correction par critères (devoir blanc & missions)', () => {
  it('crédit partiel : chaque critère coché rapporte ses points', () => {
    const score = computeCriteriaScore(QUESTIONS, { '0-0': true, '0-1': true });
    expect(score.totalMax).toBe(5);
    expect(score.totalOk).toBe(2);
    expect(score.note).toBe(8); // 2/5 → 8/20
    expect(score.pct).toBe(40);
  });

  it('tout coché → 20/20, notions acquises', () => {
    const score = computeCriteriaScore(QUESTIONS, { '0-0': true, '0-1': true, '0-2': true, '1-0': true });
    expect(score.note).toBe(20);
    expect(score.acquis).toEqual(['périmètre', 'définitions']);
    expect(score.aRenforcer).toEqual([]);
    expect(score.masteryMissed).toEqual([]);
  });

  it('rien coché → 0/20 et toutes les notions à renforcer', () => {
    const score = computeCriteriaScore(QUESTIONS, {});
    expect(score.note).toBe(0);
    expect(score.aRenforcer).toEqual(['périmètre (0/3)', 'définitions (0/2)']);
  });

  it('les points sont agrégés par notion (ok/total)', () => {
    const score = computeCriteriaScore(QUESTIONS, { '0-0': true });
    expect(score.notions['périmètre']).toEqual({ ok: 1, total: 3 });
    expect(score.notions['définitions']).toEqual({ ok: 0, total: 2 });
  });

  it('masteryMissed liste les questions dont un critère ★ obligatoire est manqué', () => {
    const score = computeCriteriaScore(QUESTIONS, { '0-0': true, '0-2': true, '1-0': true });
    expect(score.masteryMissed).toEqual([QUESTIONS[0].enonce]); // Q1-C2 obligatoire manqué
  });

  it('questionMastered : tous les critères obligatoires cochés (les autres facultatifs)', () => {
    expect(questionMastered(QUESTIONS[0], 0, { '0-0': true, '0-1': true })).toBe(true);
    expect(questionMastered(QUESTIONS[0], 0, { '0-0': true, '0-2': true })).toBe(false);
  });

  it('questionMastered sans critère obligatoire : tous les critères doivent être cochés', () => {
    const q = { enonce: 'x', correction_criteria: [{ label: 'a', points: 1 }, { label: 'b', points: 1 }] };
    expect(questionMastered(q, 0, { '0-0': true })).toBe(false);
    expect(questionMastered(q, 0, { '0-0': true, '0-1': true })).toBe(true);
  });

  it('critKey encode question + critère', () => {
    expect(critKey(2, 1)).toBe('2-1');
  });
});
