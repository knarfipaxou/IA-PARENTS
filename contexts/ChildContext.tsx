import React, { createContext, useContext, useState } from 'react';
import type { Child } from '../data/mock';

interface ChildCtxValue {
  child: Child | null;
  setChild: (c: Child | null) => void;
}

const ChildCtx = createContext<ChildCtxValue>({ child: null, setChild: () => {} });

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const [child, setChild] = useState<Child | null>(null);
  return <ChildCtx.Provider value={{ child, setChild }}>{children}</ChildCtx.Provider>;
}

export function useChild() {
  return useContext(ChildCtx);
}
