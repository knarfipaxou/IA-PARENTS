import { useCallback, useState } from 'react';
import { type Child, type Echeance } from '../../data/mock';
import { getJSON, setJSON } from '../../lib/storage';
import { hydrateChild } from './hydrateChild';

export const KEY_CHILDREN = 'ppia.children';

/** Domaine « enfants » : liste, sélection courante, et leurs échéances. */
export function useChildrenStore() {
  const [child, setChildState] = useState<Child | null>(null);
  const [kids, setKids] = useState<Child[]>([]);

  const setChild = useCallback((c: Child | null) => setChildState(c), []);

  const addChild = useCallback((data: Omit<Child, 'id'> & { id?: string }): Child => {
    const id = data.id ?? `child-${Date.now()}`;
    const c = hydrateChild({ ...data, id } as Child);
    setKids((prev) => {
      const next = [...prev, c];
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    return c;
  }, []);

  const updateChild = useCallback((id: string, patch: Partial<Child>) => {
    setKids((prev) => {
      const next = prev.map((c) => (c.id === id ? ({ ...c, ...patch } as Child) : c));
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === id ? ({ ...cur, ...patch } as Child) : cur));
  }, []);

  /** Retire l'enfant de la liste (sans toucher aux leçons/contenus, orchestré par le provider). */
  const removeChild = useCallback((id: string) => {
    setKids((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === id ? null : cur));
  }, []);

  const archiveChild = useCallback((id: string) => {
    updateChild(id, { archived: true, archivedAt: new Date().toISOString() } as Partial<Child>);
  }, [updateChild]);

  const restoreChild = useCallback((id: string) => {
    updateChild(id, { archived: false, archivedAt: undefined } as Partial<Child>);
  }, [updateChild]);

  const addEcheance = useCallback((childId: string, echeance: Echeance) => {
    const e: Echeance = { ...echeance, lessonIds: echeance.lessonIds ?? [] };
    setKids((prev) => {
      const next = prev.map((c) =>
        c.id === childId ? ({ ...c, echeances: [...(c.echeances ?? []), e] } as Child) : c
      );
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) =>
      cur && cur.id === childId ? ({ ...cur, echeances: [...(cur.echeances ?? []), e] } as Child) : cur
    );
  }, []);

  const updateEcheance = useCallback((childId: string, echeanceId: string, patch: Partial<Echeance>) => {
    const apply = (c: Child): Child =>
      ({ ...c, echeances: (c.echeances ?? []).map((e) => (e.id === echeanceId ? { ...e, ...patch } : e)) } as Child);
    setKids((prev) => {
      const next = prev.map((c) => (c.id === childId ? apply(c) : c));
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === childId ? apply(cur) : cur));
  }, []);

  const removeEcheance = useCallback((childId: string, echeanceId: string) => {
    const apply = (c: Child): Child =>
      ({ ...c, echeances: (c.echeances ?? []).filter((e) => e.id !== echeanceId) } as Child);
    setKids((prev) => {
      const next = prev.map((c) => (c.id === childId ? apply(c) : c));
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === childId ? apply(cur) : cur));
  }, []);

  /** Retire un lessonId de toutes les échéances de tous les enfants (leçon supprimée). */
  const unlinkLessonFromEcheances = useCallback((lessonId: string) => {
    const strip = (c: Child): Child => ({
      ...c,
      echeances: (c.echeances ?? []).map((e) =>
        e.lessonIds && e.lessonIds.includes(lessonId)
          ? { ...e, lessonIds: e.lessonIds.filter((x) => x !== lessonId) }
          : e
      ),
    } as Child);
    setKids((prev) => {
      const next = prev.map(strip);
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur ? strip(cur) : cur));
  }, []);

  return {
    child, setChild, kids, setKidsRaw: setKids,
    addChild, updateChild, removeChild, archiveChild, restoreChild,
    addEcheance, updateEcheance, removeEcheance, unlinkLessonFromEcheances,
  };
}
