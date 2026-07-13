import { useCallback, useRef, useState } from 'react';
import { setJSON } from '../../lib/storage';
import type { DrillSession, DrillResult } from '../../types/childProfile';

export const KEY_DRILLS = 'ppia.drills';
export const KEY_DRILL_RESULTS = 'ppia.drillResults';

/** Domaine « drills » : séances d'exercices quotidiens et leurs résultats. */
export function useDrillsStore() {
  const [drillSessions, setDrillSessions] = useState<DrillSession[]>([]);
  const [drillResults, setDrillResults] = useState<DrillResult[]>([]);
  const drillSessionsRef = useRef(drillSessions);
  drillSessionsRef.current = drillSessions;
  const drillResultsRef = useRef(drillResults);
  drillResultsRef.current = drillResults;

  const addDrillSession = useCallback((session: DrillSession) => {
    setDrillSessions((prev) => {
      const next = [session, ...prev];
      setJSON(KEY_DRILLS, next);
      return next;
    });
  }, []);

  const updateDrillSession = useCallback((id: string, patch: Partial<DrillSession>) => {
    setDrillSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      setJSON(KEY_DRILLS, next);
      return next;
    });
  }, []);

  const getDrillSessions = useCallback((childId: string): DrillSession[] => {
    return drillSessionsRef.current.filter((s) => s.childId === childId);
  }, []);

  const addDrillResult = useCallback((result: DrillResult) => {
    setDrillResults((prev) => {
      const next = [result, ...prev];
      setJSON(KEY_DRILL_RESULTS, next);
      return next;
    });
  }, []);

  const getDrillResults = useCallback((childId: string): DrillResult[] => {
    return drillResultsRef.current.filter((r) => r.childId === childId);
  }, []);

  return {
    drillSessions, setDrillSessionsRaw: setDrillSessions,
    drillResults, setDrillResultsRaw: setDrillResults,
    addDrillSession, updateDrillSession, getDrillSessions, addDrillResult, getDrillResults,
  };
}
