import {
  getLevel, getLevelProgress, getNextLevelXP, applyXP, checkBadges,
  DEFAULT_GAMIFICATION,
} from '../lib/gamification';

describe('niveaux XP', () => {
  it('mappe XP → niveau', () => {
    expect(getLevel(0).label).toBe('Novice');
    expect(getLevel(150).label).toBe('Apprenti');
    expect(getLevel(1200).label).toBe('Champion');
  });
  it('seuil du niveau suivant', () => {
    expect(getNextLevelXP(50)).toBe(100);
  });
  it('progression bornée entre 0 et 1', () => {
    const p = getLevelProgress(150);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });
});

describe('XP et badges', () => {
  it('applyXP additionne les points', () => {
    const d = applyXP(DEFAULT_GAMIFICATION, 30, 'exercise');
    expect(d.xp).toBe(30);
  });
  it('checkBadges débloque le badge 100 XP une fois le seuil atteint', () => {
    const d = applyXP({ ...DEFAULT_GAMIFICATION, xp: 90 }, 20, 'exercise');
    const { newBadges } = checkBadges(d);
    expect(newBadges).toContain('xp_100');
  });
});
