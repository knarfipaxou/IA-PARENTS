import { useCallback, useRef, useState } from 'react';
import { setJSON } from '../../lib/storage';
import type { GeneratedKind, GeneratedStore } from './types';

export const KEY_GENERATED = 'ppia.generated';

/** Domaine « contenus IA générés » rattachés à une échéance globale (par enfant + type). */
export function useGeneratedStore() {
  const [generated, setGenerated] = useState<GeneratedStore>({});
  const generatedRef = useRef(generated);
  generatedRef.current = generated;

  const saveGenerated = useCallback((childId: string, kind: GeneratedKind, content: any) => {
    setGenerated((prev) => {
      const next: GeneratedStore = { ...prev, [childId]: { ...(prev[childId] ?? {}), [kind]: content } };
      setJSON(KEY_GENERATED, next);
      return next;
    });
  }, []);

  const getGenerated = useCallback((childId: string, kind: GeneratedKind) => {
    return generatedRef.current[childId]?.[kind];
  }, []);

  const removeChildGenerated = useCallback((childId: string) => {
    setGenerated((prev) => {
      const next = { ...prev };
      delete next[childId];
      setJSON(KEY_GENERATED, next);
      return next;
    });
  }, []);

  return { generated, setGeneratedRaw: setGenerated, saveGenerated, getGenerated, removeChildGenerated };
}
