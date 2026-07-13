import { nextDeadlines, masteryForSubject, isDeadlineAtRisk } from '../lib/deadlines';
import type { ExamResult } from '../lib/examResults';

const E = (id: string, days: number) => ({ id, days });

describe('nextDeadlines', () => {
  it('classe par proximité et garde les 3 premières (bug J-8 → J-1 devant)', () => {
    const list = [E('c', 8), E('a', 1), E('d', 13), E('b', 1)];
    const top = nextDeadlines(list, 3).map((e) => e.id);
    expect(top).toEqual(['a', 'b', 'c']); // les deux J-1 puis le J-8, pas le J-13
  });
  it('ne mute pas le tableau source', () => {
    const list = [E('x', 5), E('y', 2)];
    nextDeadlines(list);
    expect(list.map((e) => e.id)).toEqual(['x', 'y']);
  });
  it('gère moins de N éléments', () => {
    expect(nextDeadlines([E('a', 3)], 3)).toHaveLength(1);
  });
});

describe('masteryForSubject', () => {
  const exams = [
    { matiere: 'Maths', note: 17 } as ExamResult,
    { matiere: 'Espagnol', note: 12 } as ExamResult,
  ];
  it('convertit la dernière note /20 en %', () => {
    expect(masteryForSubject(exams, 'Maths')).toEqual({ pct: 85, note: 17 });
  });
  it('insensible à la casse', () => {
    expect(masteryForSubject(exams, 'espagnol')?.pct).toBe(60);
  });
  it('null si matière non évaluée', () => {
    expect(masteryForSubject(exams, 'Physique')).toBeNull();
    expect(masteryForSubject(exams, undefined)).toBeNull();
  });
});

describe('isDeadlineAtRisk', () => {
  it('alerte si non évalué ou < 80 %', () => {
    expect(isDeadlineAtRisk(null)).toBe(true);
    expect(isDeadlineAtRisk({ pct: 79 })).toBe(true);
    expect(isDeadlineAtRisk({ pct: 80 })).toBe(false);
    expect(isDeadlineAtRisk({ pct: 90 })).toBe(false);
  });
});
