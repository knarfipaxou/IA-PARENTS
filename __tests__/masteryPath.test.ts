import {
  EMPTY_PATH, MISSION_ORDER, MISSION_DEFS,
  bestPct, isUnlocked, lockReason, missionStatus, missionsValidated,
  currentMission, recordMissionResult, setOverride,
  type MasteryPath,
} from '../lib/masteryPath';

function pathWith(scores: Partial<Record<string, number[]>>): MasteryPath {
  let p: MasteryPath = { missions: {} };
  for (const [id, pcts] of Object.entries(scores)) {
    for (const pct of pcts ?? []) {
      p = recordMissionResult(p, id as any, pct, '2026-07-16T10:00:00.000Z');
    }
  }
  return p;
}

describe('parcours de maîtrise — déblocages', () => {
  it('seule la Mission Mémoire est débloquée au départ', () => {
    expect(isUnlocked(EMPTY_PATH, 'memoire')).toBe(true);
    expect(isUnlocked(EMPTY_PATH, 'comprehension')).toBe(false);
    expect(isUnlocked(EMPTY_PATH, 'application')).toBe(false);
    expect(isUnlocked(EMPTY_PATH, 'defi')).toBe(false);
  });

  it('Compréhension se débloque à Mémoire ≥ 80 %', () => {
    expect(isUnlocked(pathWith({ memoire: [79] }), 'comprehension')).toBe(false);
    expect(isUnlocked(pathWith({ memoire: [80] }), 'comprehension')).toBe(true);
  });

  it('Application se débloque à Compréhension ≥ 75 %', () => {
    expect(isUnlocked(pathWith({ memoire: [90], comprehension: [74] }), 'application')).toBe(false);
    expect(isUnlocked(pathWith({ memoire: [90], comprehension: [75] }), 'application')).toBe(true);
  });

  it('Défi final se débloque à Application ≥ 75 %', () => {
    expect(isUnlocked(pathWith({ memoire: [90], comprehension: [80], application: [74] }), 'defi')).toBe(false);
    expect(isUnlocked(pathWith({ memoire: [90], comprehension: [80], application: [75] }), 'defi')).toBe(true);
  });

  it('le meilleur score compte (une tentative ratée après réussite ne reverrouille pas)', () => {
    const p = pathWith({ memoire: [85, 40] });
    expect(bestPct(p, 'memoire')).toBe(85);
    expect(isUnlocked(p, 'comprehension')).toBe(true);
  });

  it('le déblocage exceptionnel du parent ouvre une mission verrouillée', () => {
    const p = setOverride(EMPTY_PATH, 'defi');
    expect(isUnlocked(p, 'defi')).toBe(true);
    expect(lockReason(p, 'defi')).toBeNull();
  });

  it('une mission verrouillée a une raison affichable', () => {
    expect(lockReason(EMPTY_PATH, 'comprehension')).toContain('80');
    expect(lockReason(EMPTY_PATH, 'application')).toContain('75');
  });
});

describe('parcours de maîtrise — états des missions', () => {
  it('états : verrouillée / à découvrir / maîtrisée / en progression / à reprendre', () => {
    expect(missionStatus(EMPTY_PATH, 'comprehension')).toBe('verrouillee');
    expect(missionStatus(EMPTY_PATH, 'memoire')).toBe('a_decouvrir');
    expect(missionStatus(pathWith({ memoire: [85] }), 'memoire')).toBe('maitrisee');
    expect(missionStatus(pathWith({ memoire: [60] }), 'memoire')).toBe('en_progression');
    expect(missionStatus(pathWith({ memoire: [30] }), 'memoire')).toBe('a_reprendre');
  });

  it('seuils de maîtrise par mission (80 / 75 / 75 / 75)', () => {
    expect(MISSION_DEFS.memoire.masteryPct).toBe(80);
    expect(MISSION_DEFS.comprehension.masteryPct).toBe(75);
    expect(MISSION_DEFS.application.masteryPct).toBe(75);
    expect(MISSION_DEFS.defi.masteryPct).toBe(75);
  });

  it('missionsValidated compte les missions maîtrisées', () => {
    expect(missionsValidated(pathWith({ memoire: [90], comprehension: [80] }))).toBe(2);
    expect(missionsValidated(EMPTY_PATH)).toBe(0);
  });

  it('currentMission = première mission débloquée non maîtrisée, null si tout est fait', () => {
    expect(currentMission(EMPTY_PATH)).toBe('memoire');
    expect(currentMission(pathWith({ memoire: [90] }))).toBe('comprehension');
    expect(currentMission(pathWith({ memoire: [90], comprehension: [80], application: [80], defi: [80] }))).toBeNull();
  });

  it("l'ordre du parcours est Mémoire → Compréhension → Application → Défi", () => {
    expect(MISSION_ORDER).toEqual(['memoire', 'comprehension', 'application', 'defi']);
  });
});
