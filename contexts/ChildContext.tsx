import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { type Child, type Echeance } from '../data/mock';
import { getJSON, setJSON } from '../lib/storage';
import {
  type GamificationData, type XPReason, type BadgeId, DEFAULT_GAMIFICATION,
} from '../lib/gamification';
import type { ChildProfile, DrillSession, DrillResult } from '../types/childProfile';

import type { GeneratedKind, SavedLesson } from './child/types';
import { buildDemoData } from './child/demoSeed';
import { useChildrenStore, KEY_CHILDREN } from './child/useChildrenStore';
import { useLessonsStore, KEY_LESSONS } from './child/useLessonsStore';
import { useGeneratedStore, KEY_GENERATED } from './child/useGeneratedStore';
import { useGamificationStore, KEY_GAMIFICATION } from './child/useGamificationStore';
import { useProfilesStore, KEY_PROFILES } from './child/useProfilesStore';
import { useDrillsStore, KEY_DRILLS, KEY_DRILL_RESULTS } from './child/useDrillsStore';
import { hydrateChild } from './child/hydrateChild';

export type { GeneratedKind, SavedLesson };

const KEY_DEMO = 'ppia.demoSeeded';

/**
 * Contexte enfant : composition de stores par domaine (enfants/échéances,
 * leçons, contenus générés, gamification, profils, drills — voir contexts/child/).
 * L'API exposée par useChild() est volontairement inchangée pour ne pas
 * impacter les écrans qui en dépendent ; seule l'organisation interne change.
 */
interface ChildCtxValue {
  child: Child | null;
  setChild: (c: Child | null) => void;
  children: Child[];
  hydrated: boolean;
  addChild: (data: Omit<Child, 'id'> & { id?: string }) => Child;
  updateChild: (id: string, patch: Partial<Child>) => void;
  removeChild: (id: string) => void;
  archiveChild: (id: string) => void;
  restoreChild: (id: string) => void;
  deleteChildPermanently: (id: string) => void;
  addEcheance: (childId: string, echeance: Echeance) => void;
  updateEcheance: (childId: string, echeanceId: string, patch: Partial<Echeance>) => void;
  removeEcheance: (childId: string, echeanceId: string) => void;
  saveGenerated: (childId: string, kind: GeneratedKind, content: any) => void;
  getGenerated: (childId: string, kind: GeneratedKind) => any;
  lessons: SavedLesson[];
  addLesson: (lesson: Omit<SavedLesson, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => SavedLesson;
  updateLesson: (id: string, patch: Partial<SavedLesson>) => void;
  removeLesson: (id: string) => void;
  lessonsForChild: (childId: string) => SavedLesson[];
  getLesson: (id: string) => SavedLesson | undefined;
  gamification: (childId: string) => GamificationData;
  addXP: (childId: string, amount: number, reason: XPReason) => BadgeId[];
  profiles: Record<string, ChildProfile>;
  addProfile: (profile: ChildProfile) => void;
  updateProfile: (childId: string, patch: Partial<ChildProfile>) => void;
  getProfile: (childId: string) => ChildProfile | undefined;
  drillSessions: DrillSession[];
  addDrillSession: (session: DrillSession) => void;
  updateDrillSession: (id: string, patch: Partial<DrillSession>) => void;
  getDrillSessions: (childId: string) => DrillSession[];
  drillResults: DrillResult[];
  addDrillResult: (result: DrillResult) => void;
  getDrillResults: (childId: string) => DrillResult[];
}

const ChildCtx = createContext<ChildCtxValue>({
  child: null,
  setChild: () => {},
  children: [],
  hydrated: false,
  addChild: () => ({} as Child),
  updateChild: () => {},
  removeChild: () => {},
  archiveChild: () => {},
  restoreChild: () => {},
  deleteChildPermanently: () => {},
  addEcheance: () => {},
  updateEcheance: () => {},
  removeEcheance: () => {},
  saveGenerated: () => {},
  getGenerated: () => undefined,
  lessons: [],
  addLesson: () => ({ id: '', childId: '', createdAt: '', matiere: '', titre: '', notions: [], resume: '' }),
  updateLesson: () => {},
  removeLesson: () => {},
  lessonsForChild: () => [],
  getLesson: () => undefined,
  gamification: () => DEFAULT_GAMIFICATION,
  addXP: () => [],
  profiles: {},
  addProfile: () => {},
  updateProfile: () => {},
  getProfile: () => undefined,
  drillSessions: [],
  addDrillSession: () => {},
  updateDrillSession: () => {},
  getDrillSessions: () => [],
  drillResults: [],
  addDrillResult: () => {},
  getDrillResults: () => [],
});

export function ChildProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  const childrenStore = useChildrenStore();
  const lessonsStore = useLessonsStore();
  const generatedStore = useGeneratedStore();
  const gamificationStore = useGamificationStore();
  const profilesStore = useProfilesStore();
  const drillsStore = useDrillsStore();

  // ── orchestration inter-domaines (les cas où une action touche >1 store) ──

  const removeLesson = useCallback((id: string) => {
    lessonsStore.removeLesson(id);
    childrenStore.unlinkLessonFromEcheances(id);
  }, [lessonsStore, childrenStore]);

  const deleteChildPermanently = useCallback((id: string) => {
    childrenStore.removeChild(id);
    lessonsStore.removeLessonsForChild(id);
    generatedStore.removeChildGenerated(id);
  }, [childrenStore, lessonsStore, generatedStore]);

  // ── hydratation initiale (lecture AsyncStorage + amorçage des données de démo) ──
  useEffect(() => {
    (async () => {
      const stored = await getJSON<Child[] | null>(KEY_CHILDREN, null);
      const demoSeeded = await getJSON<boolean>(KEY_DEMO, false);

      if (stored && Array.isArray(stored) && stored.length > 0) {
        childrenStore.setKidsRaw(stored.map(hydrateChild));
      } else if (!demoSeeded) {
        // Premier lancement : amorce les données de démonstration
        const { kids: demoKids, lessons: demoLessons, profiles: demoProfiles } = buildDemoData();
        childrenStore.setKidsRaw(demoKids);
        lessonsStore.setLessonsRaw(demoLessons);
        await setJSON(KEY_CHILDREN, demoKids);
        await setJSON(KEY_LESSONS, demoLessons);
        await setJSON(KEY_DEMO, true);
        const gen = await getJSON<Record<string, any>>(KEY_GENERATED, {});
        generatedStore.setGeneratedRaw(gen);
        const gam = await getJSON<Record<string, GamificationData>>(KEY_GAMIFICATION, {});
        gamificationStore.setGamificationRaw(gam);
        const storedProfs = await getJSON<Record<string, ChildProfile>>(KEY_PROFILES, {});
        const profs = Object.keys(storedProfs).length > 0 ? storedProfs : demoProfiles;
        await setJSON(KEY_PROFILES, profs);
        profilesStore.setProfilesRaw(profs);
        const drills = await getJSON<DrillSession[]>(KEY_DRILLS, []);
        drillsStore.setDrillSessionsRaw(Array.isArray(drills) ? drills : []);
        const results = await getJSON<DrillResult[]>(KEY_DRILL_RESULTS, []);
        drillsStore.setDrillResultsRaw(Array.isArray(results) ? results : []);
        setHydrated(true);
        return;
      } else {
        childrenStore.setKidsRaw([]);
      }

      const gen = await getJSON<Record<string, any>>(KEY_GENERATED, {});
      generatedStore.setGeneratedRaw(gen);
      const less = await getJSON<SavedLesson[]>(KEY_LESSONS, []);
      lessonsStore.setLessonsRaw(Array.isArray(less) ? less : []);
      const gam = await getJSON<Record<string, GamificationData>>(KEY_GAMIFICATION, {});
      gamificationStore.setGamificationRaw(gam);
      const profs = await getJSON<Record<string, ChildProfile>>(KEY_PROFILES, {});
      profilesStore.setProfilesRaw(profs);
      const drills = await getJSON<DrillSession[]>(KEY_DRILLS, []);
      drillsStore.setDrillSessionsRaw(Array.isArray(drills) ? drills : []);
      const results = await getJSON<DrillResult[]>(KEY_DRILL_RESULTS, []);
      drillsStore.setDrillResultsRaw(Array.isArray(results) ? results : []);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChildCtx.Provider
      value={{
        child: childrenStore.child,
        setChild: childrenStore.setChild,
        children: childrenStore.kids,
        hydrated,
        addChild: childrenStore.addChild,
        updateChild: childrenStore.updateChild,
        removeChild: childrenStore.removeChild,
        archiveChild: childrenStore.archiveChild,
        restoreChild: childrenStore.restoreChild,
        deleteChildPermanently,
        addEcheance: childrenStore.addEcheance,
        updateEcheance: childrenStore.updateEcheance,
        removeEcheance: childrenStore.removeEcheance,
        saveGenerated: generatedStore.saveGenerated,
        getGenerated: generatedStore.getGenerated,
        lessons: lessonsStore.lessons,
        addLesson: lessonsStore.addLesson,
        updateLesson: lessonsStore.updateLesson,
        removeLesson,
        lessonsForChild: lessonsStore.lessonsForChild,
        getLesson: lessonsStore.getLesson,
        gamification: gamificationStore.gamification,
        addXP: gamificationStore.addXP,
        profiles: profilesStore.profiles,
        addProfile: profilesStore.addProfile,
        updateProfile: profilesStore.updateProfile,
        getProfile: profilesStore.getProfile,
        drillSessions: drillsStore.drillSessions,
        addDrillSession: drillsStore.addDrillSession,
        updateDrillSession: drillsStore.updateDrillSession,
        getDrillSessions: drillsStore.getDrillSessions,
        drillResults: drillsStore.drillResults,
        addDrillResult: drillsStore.addDrillResult,
        getDrillResults: drillsStore.getDrillResults,
      }}
    >
      {reactChildren}
    </ChildCtx.Provider>
  );
}

export function useChild() {
  return useContext(ChildCtx);
}
