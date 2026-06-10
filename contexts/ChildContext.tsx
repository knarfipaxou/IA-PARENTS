import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CHILDREN, type Child, type Echeance } from '../data/mock';
import { getJSON, setJSON } from '../lib/storage';

export type GeneratedKind =
  | 'lesson'
  | 'devoirs'
  | 'fiche'
  | 'flashcards'
  | 'exercices'
  | 'minitest'
  | 'controle';

type GeneratedStore = Record<string, Partial<Record<GeneratedKind, any>>>;

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
  addEcheance: (childId: string, echeance: Echeance) => void;
  saveGenerated: (childId: string, kind: GeneratedKind, content: any) => void;
  getGenerated: (childId: string, kind: GeneratedKind) => any;
}

const ChildCtx = createContext<ChildCtxValue>({
  child: null,
  setChild: () => {},
  children: [],
  hydrated: false,
  addChild: () => CHILDREN[0],
  updateChild: () => {},
  removeChild: () => {},
  addEcheance: () => {},
  saveGenerated: () => {},
  getGenerated: () => undefined,
});

const KEY_CHILDREN = 'ppia.children';
const KEY_GENERATED = 'ppia.generated';

export function ChildProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [child, setChildState] = useState<Child | null>(null);
  const [kids, setKids] = useState<Child[]>(CHILDREN);
  const [generated, setGenerated] = useState<GeneratedStore>({});
  const [hydrated, setHydrated] = useState(false);
  const generatedRef = useRef(generated);
  generatedRef.current = generated;

  // hydrate from AsyncStorage (seed with mock CHILDREN on first launch)
  useEffect(() => {
    (async () => {
      const stored = await getJSON<Child[] | null>(KEY_CHILDREN, null);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setKids(stored);
      } else {
        await setJSON(KEY_CHILDREN, CHILDREN);
      }
      const gen = await getJSON<GeneratedStore>(KEY_GENERATED, {});
      setGenerated(gen);
      setHydrated(true);
    })();
  }, []);

  const persist = useCallback((next: Child[]) => {
    setKids(next);
    setJSON(KEY_CHILDREN, next);
  }, []);

  const setChild = useCallback((c: Child | null) => {
    setChildState(c);
  }, []);

  const addChild = useCallback(
    (data: Omit<Child, 'id'> & { id?: string }): Child => {
      const id = data.id ?? `child-${Date.now()}`;
      const c = { ...data, id } as Child;
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

  const addEcheance = useCallback((childId: string, echeance: Echeance) => {
    setKids((prev) => {
      const next = prev.map((c) =>
        c.id === childId ? ({ ...c, echeances: [...(c.echeances ?? []), echeance] } as Child) : c
      );
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) =>
      cur && cur.id === childId
        ? ({ ...cur, echeances: [...(cur.echeances ?? []), echeance] } as Child)
        : cur
    );
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
        addEcheance,
        saveGenerated,
        getGenerated,
      }}
    >
      {reactChildren}
    </ChildCtx.Provider>
  );
}

export function useChild() {
  return useContext(ChildCtx);
}
