import { normalizeExamQuestions, computeExamScore } from '../lib/examScoring';

describe('normalizeExamQuestions', () => {
  it('conserve les sous-questions déjà présentes (nouveau format)', () => {
    const qs = normalizeExamQuestions(
      [{ enonce: 'Q1', sousQuestions: [{ texte: 'a) 3L=?cL', reponse: '300', notion: 'conversion' }] }],
      'général',
    );
    expect(qs[0].sousQuestions).toHaveLength(1);
    expect(qs[0].sousQuestions[0].notion).toBe('conversion');
  });

  it("convertit l'ancien format (une seule correction) en une sous-question unique", () => {
    const qs = normalizeExamQuestions(
      [{ enonce: 'Résoudre x+2=5', correction: 'x=3' }],
      'Maths',
    );
    expect(qs[0].sousQuestions).toEqual([{ texte: 'Résoudre x+2=5', reponse: 'x=3', notion: 'Maths' }]);
  });
});

describe('computeExamScore', () => {
  const questions = normalizeExamQuestions([
    {
      enonce: 'Conversions', sousQuestions: [
        { texte: 'a) 3L=?cL', reponse: '300', notion: 'conversion L-cL' },
        { texte: 'b) 250cL=?L', reponse: '2.5', notion: 'conversion cL-L' },
        { texte: 'c) 4500mL=?L', reponse: '4.5', notion: 'conversion mL-L' },
      ],
    },
  ], 'général');

  it('1 sous-question juste sur 3 → 1/3, note proportionnelle sur 20', () => {
    const score = computeExamScore(questions, { '0-0': true });
    expect(score.totalOk).toBe(1);
    expect(score.totalMax).toBe(3);
    expect(score.note).toBe(7); // round(1/3*20) = 7
  });

  it('3/3 justes → note 20, toutes les notions en acquis', () => {
    const score = computeExamScore(questions, { '0-0': true, '0-1': true, '0-2': true });
    expect(score.note).toBe(20);
    expect(score.acquis).toEqual(expect.arrayContaining(['conversion L-cL', 'conversion cL-L', 'conversion mL-L']));
    expect(score.aRenforcer).toHaveLength(0);
  });

  it('0/3 → note 0, toutes les notions à renforcer avec le format "notion (0/1)"', () => {
    const score = computeExamScore(questions, {});
    expect(score.note).toBe(0);
    expect(score.aRenforcer).toContain('conversion L-cL (0/1)');
    expect(score.acquis).toHaveLength(0);
  });

  it('aucune question → note 0 sans division par zéro', () => {
    const score = computeExamScore([], {});
    expect(score.note).toBe(0);
    expect(score.totalMax).toBe(0);
  });
});
