import { matchSubjectKey, SUBJECT_MATCHES } from '../lib/subjectMatch';

describe('matchSubjectKey', () => {
  it('reconnaît les matières usuelles quelle que soit la casse', () => {
    expect(matchSubjectKey('Mathématiques')).toBe('maths');
    expect(matchSubjectKey('CONTRÔLE DE CALCUL')).toBe('maths');
    expect(matchSubjectKey('Anglais')).toBe('anglais');
    expect(matchSubjectKey('Histoire-Géo')).toBe('histoire');
    expect(matchSubjectKey('Géographie')).toBe('geographie');
    expect(matchSubjectKey('Géométrie')).toBe('maths');
    expect(matchSubjectKey('EMC')).toBe('emc');
    expect(matchSubjectKey('Informatique')).toBe('informatique');
    expect(matchSubjectKey('Allemand')).toBe('allemand');
    expect(matchSubjectKey('Italien')).toBe('italien');
    expect(matchSubjectKey('Grec')).toBe('grec');
    expect(matchSubjectKey('SVT')).toBe('svt');
    expect(matchSubjectKey('EPS')).toBe('eps');
  });

  it('les 18 matières officielles sont toutes présentes', () => {
    expect(SUBJECT_MATCHES).toHaveLength(18);
  });

  it('repli sur "maths" pour un intitulé non reconnu', () => {
    expect(matchSubjectKey('Intitulé bizarre')).toBe('maths');
    expect(matchSubjectKey(undefined)).toBe('maths');
  });

  it('chaque clé de SUBJECT_MATCHES est unique', () => {
    const keys = SUBJECT_MATCHES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
