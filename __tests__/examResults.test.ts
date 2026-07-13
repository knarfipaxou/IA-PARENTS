import { analyzeExams, gaugeTier, type ExamResult } from '../lib/examResults';

function exam(note: number, extra: Partial<ExamResult> = {}): ExamResult {
  return {
    id: `e-${Math.round(note * 100)}`, childId: 'c1', date: '2026-07-01T10:00:00.000Z',
    titre: 'Contrôle', matiere: 'Maths', note, totalOk: note, totalMax: 20,
    acquis: [], aRenforcer: [], notionsDetail: [], ...extra,
  };
}

describe('gaugeTier — paliers de maîtrise', () => {
  it('mappe la note au bon palier', () => {
    expect(gaugeTier(6)).toBe('À renforcer');
    expect(gaugeTier(10)).toBe('En progression');
    expect(gaugeTier(14)).toBe('Bien maîtrisé');
    expect(gaugeTier(17)).toBe('Très bonne maîtrise');
    expect(gaugeTier(20)).toBe('Maîtrise excellente');
  });
});

describe('analyzeExams', () => {
  it('aucun résultat → non évalué', () => {
    const a = analyzeExams([]);
    expect(a.last).toBeUndefined();
    expect(a.gaugePct).toBe(0);
  });

  it('% principal = note/20, delta vs contrôle précédent', () => {
    // le plus récent en tête (comme stocké)
    const a = analyzeExams([exam(14), exam(12)]);
    expect(a.gaugePct).toBe(70);
    expect(a.delta).toBe(2);
    expect(a.gaugeLabel).toBe('Bien maîtrisé');
  });

  it('détecte un nouveau meilleur score', () => {
    const a = analyzeExams([exam(15), exam(12), exam(10)]);
    expect(a.bestScore).toBe(true);
    expect(a.motivation).toMatch(/meilleur score/i);
  });

  it('delta négatif quand la note baisse', () => {
    const a = analyzeExams([exam(9), exam(15)]);
    expect(a.delta).toBe(-6);
    expect(a.bestScore).toBe(false);
  });

  it('remonte les notions à renforcer comme priorités', () => {
    const a = analyzeExams([
      exam(10, { notionsDetail: [{ notion: 'conversions', ok: 0, total: 3 }] }),
    ]);
    expect(a.priorities.map((p) => p.notion)).toContain('conversions');
  });
});
