import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CHILDREN, type Child, type Echeance } from '../data/mock';
import { getJSON, setJSON } from '../lib/storage';
import type { RevisionSheet, Flashcards, Exercises, MiniTest, MockExam } from '../services/ai';

export type GeneratedKind =
  | 'lesson'
  | 'devoirs'
  | 'fiche'
  | 'flashcards'
  | 'exercices'
  | 'minitest'
  | 'controle';

type GeneratedStore = Record<string, Partial<Record<GeneratedKind, any>>>;

// ─── Saved lessons ───────────────────────────────────────────────────────────

export interface SavedLesson {
  id: string;
  childId: string;
  createdAt: string; // ISO date
  matiere: string;
  titre: string;
  niveau?: string;
  notions: string[];
  resume: string;
  imageBase64?: string;
  fiche?: RevisionSheet;
  flashcards?: Flashcards;
  exercices?: Exercises;
  minitest?: MiniTest;
  controleBlanc?: MockExam;
}

interface ChildCtxValue {
  // existing shape — kept for all current screens
  child: Child | null;
  setChild: (c: Child | null) => void;
  // store
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
  // lessons
  lessons: SavedLesson[];
  addLesson: (lesson: Omit<SavedLesson, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => SavedLesson;
  updateLesson: (id: string, patch: Partial<SavedLesson>) => void;
  removeLesson: (id: string) => void;
  lessonsForChild: (childId: string) => SavedLesson[];
  getLesson: (id: string) => SavedLesson | undefined;
}

const ChildCtx = createContext<ChildCtxValue>({
  child: null,
  setChild: () => {},
  children: [],
  hydrated: false,
  addChild: () => CHILDREN[0],
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
});

const KEY_CHILDREN = 'ppia.children';
const KEY_GENERATED = 'ppia.generated';
const KEY_LESSONS = 'ppia.lessons';

function hydrateChild(c: Child): Child {
  return {
    ...c,
    archived: c.archived ?? false,
    echeances: (c.echeances ?? []).map((e) => ({ ...e, lessonIds: e.lessonIds ?? [] })),
  } as Child;
}

export function ChildProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [child, setChildState] = useState<Child | null>(null);
  const [kids, setKids] = useState<Child[]>(CHILDREN);
  const [generated, setGenerated] = useState<GeneratedStore>({});
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const generatedRef = useRef(generated);
  generatedRef.current = generated;
  const lessonsRef = useRef(lessons);
  lessonsRef.current = lessons;

  // hydrate from AsyncStorage (seed with mock CHILDREN on first launch)
  useEffect(() => {
    (async () => {
      const stored = await getJSON<Child[] | null>(KEY_CHILDREN, null);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setKids(stored.map(hydrateChild));
      } else {
        await setJSON(KEY_CHILDREN, CHILDREN);
      }
      const gen = await getJSON<GeneratedStore>(KEY_GENERATED, {});
      setGenerated(gen);
      const less = await getJSON<SavedLesson[]>(KEY_LESSONS, []);
      setLessons(Array.isArray(less) ? less : []);
      setHydrated(true);
    })();
  }, []);

  const setChild = useCallback((c: Child | null) => {
    setChildState(c);
  }, []);

  const addChild = useCallback(
    (data: Omit<Child, 'id'> & { id?: string }): Child => {
      const id = data.id ?? `child-${Date.now()}`;
      const c = hydrateChild({ ...data, id } as Child);
      setKids((prev) => {
        const next = [...prev, c];
        setJSON(KEY_CHILDREN, next);
        return next;
      });
      return c;
    },
    []
  );

  const updateChild = useCallback((id: string, patch: Partial<Child>) => {
    setKids((prev) => {
      const next = prev.map((c) => (c.id === id ? ({ ...c, ...patch } as Child) : c));
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === id ? ({ ...cur, ...patch } as Child) : cur));
  }, []);

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

  const deleteChildPermanently = useCallback((id: string) => {
    // remove the child (échéances live on the child object) and all their lessons
    setKids((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setLessons((prev) => {
      const next = prev.filter((l) => l.childId !== id);
      setJSON(KEY_LESSONS, next);
      return next;
    });
    setGenerated((prev) => {
      const next = { ...prev };
      delete next[id];
      setJSON(KEY_GENERATED, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === id ? null : cur));
  }, []);

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
      cur && cur.id === childId
        ? ({ ...cur, echeances: [...(cur.echeances ?? []), e] } as Child)
        : cur
    );
  }, []);

  const updateEcheance = useCallback((childId: string, echeanceId: string, patch: Partial<Echeance>) => {
    const apply = (c: Child): Child =>
      ({
        ...c,
        echeances: (c.echeances ?? []).map((e) => (e.id === echeanceId ? { ...e, ...patch } : e)),
      } as Child);
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

  const saveGenerated = useCallback((childId: string, kind: GeneratedKind, content: any) => {
    setGenerated((prev) => {
      const next: GeneratedStore = {
        ...prev,
        [childId]: { ...(prev[childId] ?? {}), [kind]: content },
      };
      setJSON(KEY_GENERATED, next);
      return next;
    });
  }, []);

  const getGenerated = useCallback((childId: string, kind: GeneratedKind) => {
    return generatedRef.current[childId]?.[kind];
  }, []);

  // ─── lessons ──────────────────────────────────────────────────────────────

  const addLesson = useCallback(
    (data: Omit<SavedLesson, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): SavedLesson => {
      const lesson: SavedLesson = {
        ...data,
        id: data.id ?? `lesson-${Date.now()}`,
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
      setLessons((prev) => {
        const next = [lesson, ...prev];
        setJSON(KEY_LESSONS, next);
        return next;
      });
      return lesson;
    },
    []
  );

  const updateLesson = useCallback((id: string, patch: Partial<SavedLesson>) => {
    setLessons((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, ...patch } : l));
      setJSON(KEY_LESSONS, next);
      return next;
    });
  }, []);

  const removeLesson = useCallback((id: string) => {
    setLessons((prev) => {
      const next = prev.filter((l) => l.id !== id);
      setJSON(KEY_LESSONS, next);
      return next;
    });
    // unlink from any échéance
    setKids((prev) => {
      const next = prev.map((c) =>
        ({
          ...c,
          echeances: (c.echeances ?? []).map((e) =>
            e.lessonIds && e.lessonIds.includes(id)
              ? { ...e, lessonIds: e.lessonIds.filter((x) => x !== id) }
              : e
          ),
        } as Child)
      );
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) =>
      cur
        ? ({
            ...cur,
            echeances: (cur.echeances ?? []).map((e) =>
              e.lessonIds && e.lessonIds.includes(id)
                ? { ...e, lessonIds: e.lessonIds.filter((x) => x !== id) }
                : e
            ),
          } as Child)
        : cur
    );
  }, []);

  const lessonsForChild = useCallback((childId: string) => {
    return lessonsRef.current.filter((l) => l.childId === childId);
  }, []);

  const getLesson = useCallback((id: string) => {
    return lessonsRef.current.find((l) => l.id === id);
  }, []);

  return (
    <ChildCtx.Provider
      value={{
        child,
        setChild,
        children: kids,
        hydrated,
        addChild,
        updateChild,
        removeChild,
        archiveChild,
        restoreChild,
        deleteChildPermanently,
        addEcheance,
        updateEcheance,
        removeEcheance,
        saveGenerated,
        getGenerated,
        lessons,
        addLesson,
        updateLesson,
        removeLesson,
        lessonsForChild,
        getLesson,
      }}
    >
      {reactChildren}
    </ChildCtx.Provider>
  );
}

export function useChild() {
  return useContext(ChildCtx);
}
