import { useCallback, useRef, useState } from 'react';
import { setJSON } from '../../lib/storage';
import {
  type GamificationData, type XPReason, type BadgeId,
  DEFAULT_GAMIFICATION, applyXP, checkBadges,
} from '../../lib/gamification';

export const KEY_GAMIFICATION = 'ppia.gamification';

/** Domaine « gamification » : XP, niveaux, badges par enfant. */
export function useGamificationStore() {
  const [gamificationStore, setGamificationStore] = useState<Record<string, GamificationData>>({});
  const gamificationRef = useRef(gamificationStore);
  gamificationRef.current = gamificationStore;

  const gamification = useCallback((childId: string): GamificationData => {
    return gamificationRef.current[childId] ?? DEFAULT_GAMIFICATION;
  }, []);

  const addXP = useCallback((childId: string, amount: number, reason: XPReason): BadgeId[] => {
    let newBadges: BadgeId[] = [];
    setGamificationStore((prev) => {
      const current = prev[childId] ?? DEFAULT_GAMIFICATION;
      const afterXP = applyXP(current, amount, reason);
      const { data: afterBadges, newBadges: nb } = checkBadges(afterXP);
      newBadges = nb;
      const next = { ...prev, [childId]: afterBadges };
      setJSON(KEY_GAMIFICATION, next);
      return next;
    });
    return newBadges;
  }, []);

  return { gamificationStore, setGamificationRaw: setGamificationStore, gamification, addXP };
}
